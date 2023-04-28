// utility script to persist updated user data to new db

import path from 'path';
import fs from 'fs';
import { getFiles } from '../../api/src/dev/common';
import { flowchartValidationSchema } from '$lib/common/schema/flowchartSchema';
import { convertFlowchartToDBFlowchart } from '$lib/server/util/flowDataUtil';
import { PrismaClient } from '@prisma/client';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { DBFlowchart, User } from '@prisma/client';

const prisma = new PrismaClient();

async function syncUserData() {
  console.log('starting sync of user data to database ...');

  const dataToUpload: {
    user: User;
    flows: DBFlowchart[];
  }[] = [];

  // recursively find all JSON files and insert into db
  for await (const f of getFiles('../data/updated')) {
    if (path.extname(f) === '.json') {
      console.log(`validating data for user ${f}`);

      try {
        const { user: userMetadata, flows: userFlowData } = JSON.parse(fs.readFileSync(f, 'utf8'));

        const userDataUpload = {
          user: userMetadata,
          flows: []
        };

        (userFlowData as Flowchart[]).forEach((flow, idx) => {
          const parseResults = flowchartValidationSchema.safeParse({
            ...flow,
            // deserialize into object for validation
            lastUpdatedUTC: new Date(flow.lastUpdatedUTC)
          });

          // do it this way to fix type error with discriminated union
          if (parseResults.success === false) {
            console.log(
              `user [${userMetadata.username}] flow [${flow.name}] failed validation with the following errors (will be skipped):`,
              parseResults.error.flatten()
            );
          } else {
            userDataUpload.flows.push(
              convertFlowchartToDBFlowchart({
                flowchart: parseResults.data,
                pos: idx
              })
            );
          }
        });

        console.log('successfully validated data for user', userMetadata.username);
        dataToUpload.push(userDataUpload);
      } catch {
        console.log('error with parsing (most likely file is empty)');
      }
    }
  }

  console.log('validated user data, uploading ...');

  for (const user of dataToUpload) {
    console.log('syncing user data for', user.user.username);
    await prisma.user.create({
      data: user.user
    });
    await prisma.dBFlowchart.createMany({
      data: user.flows.map((flow) => {
        // see https://stackoverflow.com/questions/70787660/generated-types-in-prisma-do-not-have-optional-fields-as-defined-in-the-schema
        // for why we have this deletion here
        delete flow.validationData;
        return {
          ...flow
        };
      })
    });
  }

  console.log('finished syncing user data to db');
}

syncUserData();
