import fs from 'fs';
import https from 'https';
import { parse as csvParse } from 'csv-parse/sync';

import { apiRoot } from './common.js';

import type { APICourse, TermTypicallyOffered } from '@prisma/client';

// helper functions
async function download(url: string, dest: string) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(null);
        });
      })
      .on('error', (err) => {
        // Handle errors
        fs.unlinkSync(dest); // Delete the file async. (But we don't check the result)
        reject(err);
      });
  });
}

// pulls raw CSV data and saves it as JSON
async function getTermTypicallyOfferedData() {
  console.log('start term typically offered data update');

  // download CSV
  console.log('downloading CSV ...');
  await download(
    'https://tto.calpoly.edu/csv-to-html-table-master/tto/Course_Term_Typically_Offered.csv',
    `${apiRoot}/data/cpslo-term-typically-offered.csv`
  );

  // get JSON records out of CSV
  console.log('getting JSON records from CSV ...');
  const fileContent = fs.readFileSync(`${apiRoot}/data/cpslo-term-typically-offered.csv`);
  const records = csvParse(fileContent, { columns: true });

  // trim records to only what we need (can't use imported types here)
  const termData: TermTypicallyOffered[] = [];
  let invalidCount = 0;

  // need to get all course data bc we need to match that to catalog since some courses
  // dont exist on some catalogs
  const allCourseData: APICourse[] = [];
  const eligibleCatalogYears: string[] = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-catalog-years.json`, 'utf8')
  );
  for (const c of eligibleCatalogYears) {
    const courseDataSpecificCatalog: APICourse[] = JSON.parse(
      fs.readFileSync(`${apiRoot}/data/courses/${c}/${c}.json`, 'utf8')
    );
    allCourseData.push(...courseDataSpecificCatalog);
  }

  // fs.writeFileSync(
  //   `${apiRoot}/data/courses/all-courses.json`,
  //   JSON.stringify(allCourseData, null, 2)
  // );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  records.forEach((record: any) => {
    const courseName = record.Course.replace('-', '');
    const catalog = allCourseData.find((c) => c.id === courseName)?.catalog;
    if (!catalog) {
      console.log(
        'TERM TYPICALLY OFFERED COURSE DOES NOT EXIST IN COURSE DATA! SKIPPING',
        courseName
      );
      invalidCount += 1;
    } else if (termData.find((cTermData) => cTermData.id === courseName)) {
      console.log('DUPLICATE COURSE FOUND IN TTO DATA', courseName);
    } else {
      termData.push({
        id: courseName,
        catalog,
        termSummer: record.Summer === 'Summer',
        termFall: record.Fall === 'Fall',
        termWinter: record.Winter === 'Winter',
        termSpring: record.Spring === 'Spring'
      });
    }
  });

  // write out JSON for use in API
  console.log(
    `writing JSON to API source, ${invalidCount}/${records.length} records skipped due to not being in course records ...`
  );
  fs.writeFileSync(
    `${apiRoot}/data/cpslo-term-typically-offered.json`,
    JSON.stringify(termData, null, 2)
  );

  // cleanup
  fs.unlinkSync(`${apiRoot}/data/cpslo-term-typically-offered.csv`);
  console.log('term data update complete');
}

getTermTypicallyOfferedData();
