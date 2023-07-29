import fs from 'fs';
import path from 'path';

import { ZodError } from 'zod';
import { Prisma, PrismaClient } from '@prisma/client';
import { flowchartValidationSchema } from '$lib/common/schema/flowchartSchema';
import { apiRoot, getFiles, nthIndex } from './common';

import type {
  TermTypicallyOffered,
  TemplateFlowchart,
  CourseRequisite,
  GECourse,
  APICourse,
  Program
} from '@prisma/client';

interface TemplateFlowchartMetadata {
  flows: Program[];
  cSheets: Program[];
}

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

  const catalogYears = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-catalog-years.json`, 'utf8')
  ) as string[];
  const startYears = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-start-years.json`, 'utf8')
  ) as string[];

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

  const catalogYears = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-catalog-years.json`, 'utf8')
  ) as string[];

  for (const curCatalogYear of catalogYears) {
    const courseData = JSON.parse(
      fs.readFileSync(`${apiRoot}/data/courses/${curCatalogYear}/${curCatalogYear}.json`, 'utf8')
    ) as APICourse[];
    const geCourseData = JSON.parse(
      fs.readFileSync(`${apiRoot}/data/courses/${curCatalogYear}/${curCatalogYear}-GE.json`, 'utf8')
    ) as GECourse[];
    const reqCourseData = JSON.parse(
      fs.readFileSync(
        `${apiRoot}/data/courses/${curCatalogYear}/${curCatalogYear}-req.json`,
        'utf8'
      )
    ) as CourseRequisite[];

    console.log('syncing course data for catalog', curCatalogYear);
    await prisma.aPICourse.createMany({
      data: courseData,
      skipDuplicates: true
    });

    // set course overrides
    if (
      fs.existsSync(`${apiRoot}/data/courses/${curCatalogYear}/${curCatalogYear}-override.json`)
    ) {
      console.log('applying course override data for catalog', curCatalogYear);
      const courseOverrideData = JSON.parse(
        fs.readFileSync(
          `${apiRoot}/data/courses/${curCatalogYear}/${curCatalogYear}-override.json`,
          'utf8'
        )
      ) as APICourse[];

      for await (const course of courseOverrideData) {
        console.log('update course', course.id);
        await prisma.aPICourse.update({
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
  const programData = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-template-flow-data.json`, 'utf8')
  ) as TemplateFlowchartMetadata;

  console.log('syncing program data with db ...');
  await prisma.program.createMany({
    data: programData.flows
  });
  console.log('program sync complete');
}

async function syncTermTypicallyOfferedData() {
  const termTypicallyOfferedData = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-term-typically-offered.json`, 'utf8')
  ) as TermTypicallyOffered[];

  console.log('syncing term typically offered data with db ...');
  await prisma.termTypicallyOffered.createMany({
    data: termTypicallyOfferedData
  });
  console.log('term typically offered sync complete');
}

async function syncTemplateFlowcharts() {
  console.log('starting update of default flows to database ...');

  // load template data
  const flowDataLinks = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-template-flow-data.json`, 'utf8')
  ) as TemplateFlowchartMetadata;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const defaultFlows: TemplateFlowchart[] = [];

  // recursively find all JSON files and insert into db
  for await (const f of getFiles(`${apiRoot}/data/flows/json/dflows`)) {
    if (path.extname(f) === '.json') {
      console.log(`validating schema for ${f}`);

      try {
        const rawFlowData = JSON.parse(fs.readFileSync(f, 'utf8')) as unknown;
        const defaultFlowData = flowchartValidationSchema.parse(rawFlowData);

        const flowProgramData = flowDataLinks.flows.find(
          (flowDataLinkEntry) => flowDataLinkEntry.id === defaultFlowData.programId[0]
        );

        if (!flowProgramData) {
          console.log('FLOWPROGRAMDATA RETURNED UNDEFINED, SKIPPING (most likely a name mismatch)');
          continue;
        }

        const flowCSheetData = flowDataLinks.cSheets.find(
          (flowCSheetLinkEntry) =>
            flowCSheetLinkEntry.code ===
            (flowProgramData.code.substring(0, nthIndex(flowProgramData.code, '.', 2)) ||
              flowProgramData.code)
        );

        if (!flowCSheetData) {
          console.log('FLOWCSHEETDATA RETURNED UNDEFINED, SKIPPING (most likely a name mismatch)');
          continue;
        }

        // create appropriate TemplateFlowchart entry
        defaultFlows.push({
          programId: flowProgramData.id,
          flowUnitTotal: defaultFlowData.unitTotal,
          termData: defaultFlowData.termData,
          version: defaultFlowData.version,
          notes: `This is a default, template flowchart. Change it to fit your needs! Here are some official Cal Poly resources for this flowchart:\n\n* Flowchart: "${flowProgramData.dataLink}"\n* Curriculum Sheet: "${flowCSheetData.dataLink}"`
        });
      } catch (e) {
        if (e instanceof ZodError) {
          console.log('flowchart validation failed', e);
        } else {
          console.log('error occurred while getting flow-specific notes, skipping', e);
        }
      }
    }
  }

  console.log('setup default flows, uploading ...');
  // fs.writeFileSync('allDFlowsOut.json', JSON.stringify(defaultFlows, null, 2));

  await prisma.templateFlowchart.createMany({
    data: defaultFlows
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

void syncAllAPIData();
