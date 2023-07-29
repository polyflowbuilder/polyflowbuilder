// will produce prereq files with the following fields:
// - prerequisite classes
// - corequisite classes
// - recommended classes

import fs from 'fs';

import { apiRoot } from './common';

import type { APICourse, CourseRequisite } from '@prisma/client';

// - concurrent classes
function generateCourseRequisiteData(catalogYearString: string) {
  console.log(`generating course prereq/coreq/recommended data for ${catalogYearString}...`);
  // read data
  const courseData = JSON.parse(
    fs.readFileSync(
      `${apiRoot}/data/courses/${catalogYearString}/${catalogYearString}.json`,
      'utf8'
    )
  ) as APICourse[];
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
    if (searchString.includes('Prerequisite:')) {
      prereqString = searchString.substring(
        searchString.indexOf('Prerequisite:') + 14,
        searchString.indexOf('.', searchString.indexOf('Prerequisite:'))
      );
    } else if (searchString.includes('Prerequisites:')) {
      prereqString = searchString.substring(
        searchString.indexOf('Prerequisites:') + 15,
        searchString.indexOf('.', searchString.indexOf('Prerequisites:'))
      );
    }

    if (searchString.includes('Corequisite:')) {
      coreqString = searchString.substring(
        searchString.indexOf('Corequisite:') + 13,
        searchString.indexOf('.', searchString.indexOf('Corequisite:'))
      );
    }
    if (searchString.includes('Recommended:')) {
      recommendedString = searchString.substring(
        searchString.indexOf('Recommended:') + 13,
        searchString.indexOf('.', searchString.indexOf('Recommended:'))
      );
    }
    if (searchString.includes('Concurrent:')) {
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
      searchStringCDescCheck.includes('Prerequisite:') ||
      searchStringCDescCheck.includes('Prerequisites:') ||
      searchStringCDescCheck.includes('Corequisite:') ||
      searchStringCDescCheck.includes('Recommended:') ||
      searchStringCDescCheck.includes('Concurrent:')
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
    // disable lint rule here bc we may change this manually
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

  catalogNames.forEach((catalogName) => {
    generateCourseRequisiteData(catalogName);
  });
}

generateCourseRequisiteDataAllCatalogs();
