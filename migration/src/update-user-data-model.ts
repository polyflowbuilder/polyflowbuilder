// utility script to update user data model to the latest version

import path from 'path';
import fs from 'fs';
import * as apiDataConfig from '$lib/server/config/apiDataConfig';
import { getFiles } from '../../api/src/dev/common';
import { v4 as uuid } from 'uuid';
import { updateFlowchartDataModel } from '$lib/server/util/userDataModelSync';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { User } from '@prisma/client';

// first init apidata
await apiDataConfig.init();

async function updateUserFlowchartDataModels() {
  await apiDataConfig.init();
  for await (const f of getFiles('../data/dump')) {
    if (path.extname(f) === '.json') {
      console.log(`attempt data version update for user data ${f}`);

      const userData = JSON.parse(fs.readFileSync(f, 'utf8'));

      // build new user object
      const newUserData: User = {
        id: uuid(),
        username: userData.username,
        password: userData.password,
        email: userData.email,
        createDateUTC: new Date(userData.createDate),
        lastLoginTimeUTC: new Date(userData.lastLoginDate)
      };

      const updatedFlowcharts: Flowchart[] = [];

      // update each flowchart
      for (const flow of userData.data.flows) {
        // there are flows in prod data that are just null for some reason, skip these
        if (flow?.dataModelVersion || flow?.version) {
          updatedFlowcharts.push(updateFlowchartDataModel(newUserData.id, flow));
        }
      }

      fs.writeFileSync(
        `../data/updated/${path.basename(f)}`,
        JSON.stringify(
          {
            user: newUserData,
            flows: updatedFlowcharts
          },
          null,
          2
        )
      );
    }
  }
}

updateUserFlowchartDataModels();
