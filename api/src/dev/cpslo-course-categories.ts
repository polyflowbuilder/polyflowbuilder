import fs from 'fs';

import { apiRoot } from './common';

// API data types
import type { APICourse, GECourse } from '@prisma/client';

function sniffGWRCourses(inFile: string, outFile: string) {
  console.log(`starting sniffGWRcourses, infile ${inFile}, outFile ${outFile}`);

  const courseData: APICourse[] = JSON.parse(fs.readFileSync(inFile, 'utf8'));
  const gwrCourses: string[] = [];

  for (let i = 0; i < courseData.length; i += 1) {
    const c = courseData[i];
    if (c.addl.includes('GWR\n') || c.addl.includes('GWR;')) {
      courseData[i].gwrCourse = true;
      gwrCourses.push(`${c.catalog}-${c.id}`);
    }
  }

  fs.writeFileSync(outFile, JSON.stringify(gwrCourses, null, 2));
  fs.writeFileSync(inFile, JSON.stringify(courseData, null, 2));
  console.log(
    `successfully wrote sniffed GWR courses to ${outFile} and updated original course data`
  );
}
function sniffUSCPCourses(inFile: string, outFile: string) {
  console.log(`starting sniffUSCPcourses, infile ${inFile}, outFile ${outFile}`);

  const courseData: APICourse[] = JSON.parse(fs.readFileSync(inFile, 'utf8'));
  const uscpCourses: string[] = [];

  for (let i = 0; i < courseData.length; i += 1) {
    const c = courseData[i];
    if (c.addl.includes('USCP\n') || c.addl.includes('USCP;')) {
      courseData[i].uscpCourse = true;
      uscpCourses.push(`${c.catalog}-${c.id}`);
    }
  }

  fs.writeFileSync(outFile, JSON.stringify(uscpCourses, null, 2));
  fs.writeFileSync(inFile, JSON.stringify(courseData, null, 2));
  console.log(
    `successfully wrote sniffed USCP courses to ${outFile} and updated original course data`
  );
}
function sniffGECourses(inFile: string, outFile: string) {
  console.log(`starting sniffGEcourses, infile ${inFile}, outFile ${outFile}`);

  const courseData: APICourse[] = JSON.parse(fs.readFileSync(inFile, 'utf8'));
  const geCourses: GECourse[] = [];

  for (let i = 0; i < courseData.length; i += 1) {
    const c = courseData[i];

    if (c.addl.includes('GE Area A1\n') || c.addl.includes('GE Area A1;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'A1'
      });
    }
    if (c.addl.includes('GE Area A2\n') || c.addl.includes('GE Area A2;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'A2'
      });
    }
    if (c.addl.includes('GE Area A3\n') || c.addl.includes('GE Area A3;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'A3'
      });
    }
    if (c.addl.includes('GE Area B1\n') || c.addl.includes('GE Area B1;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'B1'
      });
    }
    if (c.addl.includes('GE Area B2\n') || c.addl.includes('GE Area B2;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'B2'
      });
    }
    if (c.addl.includes('GE Area B3\n') || c.addl.includes('GE Area B3;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'B3'
      });
    }
    if (c.addl.includes('GE Area B4\n') || c.addl.includes('GE Area B4;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'B4'
      });
    }
    if (c.addl.includes('Upper-Div GE Area B\n') || c.addl.includes('Upper-Div GE Area B;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'UPPER_DIVISION_B'
      });
    }
    if (c.addl.includes('GE Area C1\n') || c.addl.includes('GE Area C1;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'C1'
      });
    }
    if (c.addl.includes('GE Area C2\n') || c.addl.includes('GE Area C2;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'C2'
      });
    }
    if (c.addl.includes('Upper-Div GE Area C\n') || c.addl.includes('Upper-Div GE Area C;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'UPPER_DIVISION_C'
      });
    }
    if (c.addl.includes('GE Area D1\n') || c.addl.includes('GE Area D1;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'D1'
      });
    }
    if (c.addl.includes('GE Area D2\n') || c.addl.includes('GE Area D2;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'D2'
      });
    }
    if (c.addl.includes('Upper-Div GE Area D\n') || c.addl.includes('Upper-Div GE Area D;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'UPPER_DIVISION_D'
      });
    }
    if (c.addl.includes('GE Area E\n') || c.addl.includes('GE Area E;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'E'
      });
    }
    if (c.addl.includes('GE Area F\n') || c.addl.includes('GE Area F;')) {
      geCourses.push({
        catalog: c.catalog,
        id: c.id,
        category: 'F'
      });
    }
  }

  fs.writeFileSync(outFile, JSON.stringify(geCourses, null, 2));
  fs.writeFileSync(inFile, JSON.stringify(courseData, null, 2));
  console.log(
    `successfully wrote sniffed GE courses to ${outFile} and updated original course data`
  );
}

function findGWRUSCPGECoursesAllCatalogs() {
  // will sniff out GWR & USCP courses in all catalogs
  // ***MAKE SURE TO STILL MANUALLY VERIFY!***

  const catalogYears: string[] = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-catalog-years.json`, 'utf8')
  );

  (async () => {
    for await (const f of catalogYears) {
      console.log(`sniffing GWR courses for catalog ${f}`);
      sniffGWRCourses(
        `${apiRoot}/data/courses/${f}/${f}.json`,
        `${apiRoot}/data/courses/${f}/${f}-GWR.json`
      );

      console.log(`sniffing USCP courses for ${f}`);
      sniffUSCPCourses(
        `${apiRoot}/data/courses/${f}/${f}.json`,
        `${apiRoot}/data/courses/${f}/${f}-USCP.json`
      );

      console.log(`sniffing GE courses for ${f}`);
      sniffGECourses(
        `${apiRoot}/data/courses/${f}/${f}.json`,
        `${apiRoot}/data/courses/${f}/${f}-GE.json`
      );
    }
  })();
}

// run after we generate courses using cpslo-courses as it requires that folder structure to exist
findGWRUSCPGECoursesAllCatalogs();
