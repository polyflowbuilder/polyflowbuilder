// will produce prereq files with the following fields:
// - prerequisite classes
// - corequisite classes
// - recommended classes

import fs from 'fs';

import { apiRoot } from './common.js';

import type { APICourse, CourseRequisite } from '@prisma/client';

// - concurrent classes
function generateCourseRequisiteData(catalogYearString: string) {
  console.log(`generating course prereq/coreq/recommended data for ${catalogYearString}...`);
  // read data
  const courseData: APICourse[] = JSON.parse(
    fs.readFileSync(
      `${apiRoot}/data/courses/${catalogYearString}/${catalogYearString}.json`,
      'utf8'
    )
  );
  const prereqData: CourseRequisite[] = [];

  // for static course data overrides
  const OVERWRITE_EXISTING_OVERRIDE_COURSE_LIST = false;
  const overrideCoursesList: APICourse[] = [];

  courseData.forEach((course: APICourse) => {
    // generate strings
    let prereqString = '';
    let coreqString = '';
    let recommendedString = '';
    let concurrentString = '';

    // replace "prerequisite or concurrent" and "prerequisite or corequisite" with corequisite
    // (because that's what it is)
    let searchString = course.addl;
    searchString = searchString.replace(
      /prerequisite or concurrent|prerequisite or corequisite/gi,
      'Corequisite'
    );

    // extra cond for prereq due to 'prerequisites' (with an s)
    if (searchString.indexOf('Prerequisite:') !== -1) {
      prereqString = searchString.substring(
        searchString.indexOf('Prerequisite:') + 14,
        searchString.indexOf('.', searchString.indexOf('Prerequisite:'))
      );
    } else if (searchString.indexOf('Prerequisites:') !== -1) {
      prereqString = searchString.substring(
        searchString.indexOf('Prerequisites:') + 15,
        searchString.indexOf('.', searchString.indexOf('Prerequisites:'))
      );
    }

    if (searchString.indexOf('Corequisite:') !== -1) {
      coreqString = searchString.substring(
        searchString.indexOf('Corequisite:') + 13,
        searchString.indexOf('.', searchString.indexOf('Corequisite:'))
      );
    }
    if (searchString.indexOf('Recommended:') !== -1) {
      recommendedString = searchString.substring(
        searchString.indexOf('Recommended:') + 13,
        searchString.indexOf('.', searchString.indexOf('Recommended:'))
      );
    }
    if (searchString.indexOf('Concurrent:') !== -1) {
      concurrentString = searchString.substring(
        searchString.indexOf('Concurrent:') + 12,
        searchString.indexOf('.', searchString.indexOf('Concurrent:'))
      );
    }

    // check to see if any course details are present in cDesc
    // if they are, this needs to be resolved manually in [catalog]-override.json
    const searchStringCDescCheck = course.desc.replace(
      /prerequisite or concurrent|prerequisite or corequisite/gi,
      'Corequisite'
    );
    if (
      searchStringCDescCheck.indexOf('Prerequisite:') !== -1 ||
      searchStringCDescCheck.indexOf('Prerequisites:') !== -1 ||
      searchStringCDescCheck.indexOf('Corequisite:') !== -1 ||
      searchStringCDescCheck.indexOf('Recommended:') !== -1 ||
      searchStringCDescCheck.indexOf('Concurrent:') !== -1
    ) {
      // create [catalog]-override.json and add these courses into it for easier modification
      console.log(
        'ADDL COURSE REQ DATA FOUND IN CDESC (resolve this manually by editing the [catalog]-override.json file)! Catalog:',
        catalogYearString,
        'Course:',
        course.id
      );
      overrideCoursesList.push(course);
    }

    // push to new object
    prereqData.push({
      id: course.id,
      catalog: course.catalog,
      prerequisite: prereqString.split(/,|, and /),
      corequisite: coreqString.split(','),
      recommended: recommendedString.split(','),
      concurrent: concurrentString.split(',')
    });
  });

  console.log('writing out JSON API static course data');

  fs.writeFileSync(
    `${apiRoot}/data/courses/${catalogYearString}/${catalogYearString}-req-raw.json`,
    JSON.stringify(prereqData, null, 2)
  );

  // write out [catalog]-override.json file
  if (
    fs.existsSync(
      `${apiRoot}/data/courses/${catalogYearString}/${catalogYearString}-override.json`
    ) &&
    !OVERWRITE_EXISTING_OVERRIDE_COURSE_LIST
  ) {
    console.log(
      'Override file already exists; NOT overwriting due to overwrite flag not being set.'
    );
  } else if (overrideCoursesList.length) {
    fs.writeFileSync(
      `${apiRoot}/data/courses/${catalogYearString}/${catalogYearString}-override.json`,
      JSON.stringify(overrideCoursesList, null, 2)
    );
    console.log('Override file written out successfully.');
  }

  console.log('done!');
}

function generateCourseRequisiteDataAllCatalogs() {
  const catalogNames = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-catalog-years.json`, 'utf8')
  ) as string[];

  catalogNames.forEach((catalogName) => generateCourseRequisiteData(catalogName));
}

// only needed temporarily
function convertOldRequisiteDataToNew() {
  const catalogNames = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/cpslo-catalog-years.json`, 'utf8')
  ) as string[];

  catalogNames.forEach((catalogName) => {
    const oldReqData: any[] = JSON.parse(
      fs.readFileSync(`${apiRoot}/data/courses/${catalogName}/${catalogName}-req.json`, 'utf8')
    );
    const newReqData: CourseRequisite[] = [];

    oldReqData.forEach((val) => {
      newReqData.push({
        catalog: catalogName,
        id: val.cID,
        prerequisite: val.prereq,
        corequisite: val.coreq,
        recommended: val.recomm,
        concurrent: val.concur
      });
    });

    fs.writeFileSync(
      `${apiRoot}/data/courses/${catalogName}/${catalogName}-req-updated.json`,
      JSON.stringify(newReqData, null, 2)
    );
  });
}

generateCourseRequisiteDataAllCatalogs();
