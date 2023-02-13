import fs from 'fs';
import path from 'path';

import { Prisma, PrismaClient } from '@prisma/client';
import { apiRoot, getFiles, nthIndex } from './common.js';

import type {
  TermTypicallyOffered,
  CourseRequisite,
  GECourse,
  Course,
  Program
} from '@prisma/client';

type TemplateFlowchartMetadata = {
  flows: Program[];
  cSheets: Program[];
};

const prisma = new PrismaClient();

async function clearAPIData() {
  console.log('clearing API data from database ...');
  await prisma.$transaction([
    prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;'),
    prisma.$executeRawUnsafe('TRUNCATE TABLE Flowchart;'),
    prisma.$executeRawUnsafe('TRUNCATE TABLE TermTypicallyOffered;'),
    prisma.$executeRawUnsafe('TRUNCATE TABLE GECourse;'),
    prisma.$executeRawUnsafe('TRUNCATE TABLE CourseRequisite;'),
    prisma.$executeRawUnsafe('TRUNCATE TABLE Course;'),
    prisma.$executeRawUnsafe('TRUNCATE TABLE TemplateFlowchart;'),
    prisma.$executeRawUnsafe('TRUNCATE TABLE Program;'),
    prisma.$executeRawUnsafe('TRUNCATE TABLE StartYear;'),
    prisma.$executeRawUnsafe('TRUNCATE TABLE Catalog;'),
    prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;')
  ]);
}

async function syncCatalogStartYears() {
  console.log('starting db sync of catalog and start years ...');

  const catalogYears: string[] = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-catalog-years.json`, 'utf8')
  );
  const startYears: string[] = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-start-years.json`, 'utf8')
  );

  await prisma.catalog.createMany({
    data: catalogYears.map((catalog) => {
      return {
        catalog
      };
    }),
    skipDuplicates: true
  });

  await prisma.startYear.createMany({
    data: startYears.map((year) => {
      return {
        year
      };
    }),
    skipDuplicates: true
  });

  console.log('sync of catalog and start years complete');
}

async function syncCourseData() {
  console.log('starting db sync of course data ...');

  const catalogYears: string[] = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-catalog-years.json`, 'utf8')
  );

  for (let i = 0; i < catalogYears.length; i += 1) {
    const curCatalogYear = catalogYears[i];
    const courseData: Course[] = JSON.parse(
      fs.readFileSync(`${apiRoot}/data/courses/${curCatalogYear}/${curCatalogYear}.json`, 'utf8')
    );
    const geCourseData: GECourse[] = JSON.parse(
      fs.readFileSync(`${apiRoot}/data/courses/${curCatalogYear}/${curCatalogYear}-GE.json`, 'utf8')
    );
    const reqCourseData: CourseRequisite[] = JSON.parse(
      fs.readFileSync(
        `${apiRoot}/data/courses/${curCatalogYear}/${curCatalogYear}-req.json`,
        'utf8'
      )
    );

    console.log('syncing course data for catalog', curCatalogYear);
    await prisma.course.createMany({
      data: courseData,
      skipDuplicates: true
    });

    // set course overrides
    if (
      fs.existsSync(`${apiRoot}/data/courses/${curCatalogYear}/${curCatalogYear}-override.json`)
    ) {
      console.log('applying course override data for catalog', curCatalogYear);
      const courseOverrideData: Course[] = JSON.parse(
        fs.readFileSync(
          `${apiRoot}/data/courses/${curCatalogYear}/${curCatalogYear}-override.json`,
          'utf8'
        )
      );

      for await (const course of courseOverrideData) {
        console.log('update course', course.id);
        await prisma.course.update({
          data: {
            desc: course.desc,
            addl: course.addl
          },
          where: {
            id_catalog: {
              catalog: course.catalog,
              id: course.id
            }
          }
        });
      }
    }

    await prisma.gECourse.createMany({
      data: geCourseData
    });
    await prisma.courseRequisite.createMany({
      data: reqCourseData.map((data) => {
        return {
          catalog: data.catalog,
          id: data.id,
          // see https://github.com/prisma/prisma/issues/9247
          // will never be null, so overwrite this way (even tho not recommended)
          prerequisite: data.prerequisite as Prisma.JsonArray,
          corequisite: data.corequisite as Prisma.JsonArray,
          recommended: data.recommended as Prisma.JsonArray,
          concurrent: data.concurrent as Prisma.JsonArray
        };
      })
    });
  }

  console.log('db sync of course data finished successfully');
}

async function syncProgramData() {
  const programData: TemplateFlowchartMetadata = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-template-flow-data.json`, 'utf8')
  );

  console.log('syncing program data with db ...');
  await prisma.program.createMany({
    data: programData.flows
  });
  console.log('program sync complete');
}

async function syncTermTypicallyOfferedData() {
  const termTypicallyOfferedData: TermTypicallyOffered[] = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-term-typically-offered.json`, 'utf8')
  );

  console.log('syncing term typically offered data with db ...');
  await prisma.termTypicallyOffered.createMany({
    data: termTypicallyOfferedData
  });
  console.log('term typically offered sync complete');
}

// TODO: update template flows to fit new UUID-id schema
async function syncTemplateFlowcharts() {
  console.log('starting update of default flows to database ...');

  // load template data
  const flowDataLinks: TemplateFlowchartMetadata = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-template-flow-data.json`, 'utf8')
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const defaultFlows: any[] = [];

  // recursively find all JSON files and insert into db
  for await (const f of getFiles(`${apiRoot}/data/flows/json/dflows`)) {
    if (path.extname(f) === '.json') {
      console.log(`adding ${f} to defaultflows DB`);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let defaultFlowData: any = null;

      try {
        defaultFlowData = JSON.parse(fs.readFileSync(f, 'utf8'));
      } catch {
        console.log('error with parsing (most likely file is empty)');
      }
      if (defaultFlowData?.flowName != null) {
        // use cpslo-default-flow-data-links to generate flow-specific notes
        try {
          const flowIdUUID = flowDataLinks.flows.find(
            (flowDataLinkEntry) => flowDataLinkEntry.code === defaultFlowData.flowId
          )?.id;
          const flowLink = flowDataLinks.flows.find(
            (flowDataLinkEntry) => flowDataLinkEntry.code === defaultFlowData.flowId
          )?.dataLink;
          const cSheetLink = flowDataLinks.cSheets.find(
            (flowCSheetLinkEntry) =>
              flowCSheetLinkEntry.code ===
              (defaultFlowData.flowId.substring(0, nthIndex(defaultFlowData.flowId, '.', 2)) ||
                defaultFlowData.flowId)
          )?.dataLink;

          if (!flowLink) {
            console.log(
              'FLOWLINK RETURNED UNDEFINED, EXPECT BAD LOOKUP (most likely a name mismatch)',
              defaultFlowData.flowName
            );
          }
          if (!cSheetLink) {
            console.log(
              'CSHEETLINK RETURNED UNDEFINED, EXPECT BAD LOOKUP (most likely a name mismatch)',
              defaultFlowData.flowName
            );
          }

          const specificFlowNotes = `This is a default, template flowchart. Change it to fit your needs! Here are some official Cal Poly resources for this flowchart:\n\n* Flowchart: "${flowLink}"\n* Curriculum Sheet: "${cSheetLink}"`;

          defaultFlowData.flowNotes = specificFlowNotes;
          console.log('flow notes updated with custom ones successfully');

          defaultFlowData.flowId = flowIdUUID;
        } catch (error) {
          console.log('error occurred while getting flow-specific notes, skipping', error);
        }

        defaultFlows.push(defaultFlowData);
      } else {
        console.log('skipping data upload, data is null ...');
      }
    }
  }

  // TODO: validate flows before uploading
  console.log('setup default flows, uploading ...');
  // fs.writeFileSync('allDFlowsOut.json', JSON.stringify(defaultFlows, null, 2));

  await prisma.templateFlowchart.createMany({
    data: defaultFlows.map((flow) => {
      return {
        programId: flow.flowId,
        flowUnitTotal: flow.flowUnitTotal.toString(),
        termData: flow.data,
        version: flow.dataModelVersion,
        notes: flow.flowNotes
      };
    })
  });

  console.log('finished updating default flows DB');
}

async function syncAllAPIData() {
  await clearAPIData();
  await syncCatalogStartYears();
  await syncCourseData();
  await syncProgramData();
  await syncTermTypicallyOfferedData();
  await syncTemplateFlowcharts();
}

syncAllAPIData();
