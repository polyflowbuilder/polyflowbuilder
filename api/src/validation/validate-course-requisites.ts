import fs from 'fs';

import { apiRoot } from '../dev/common.js';
import { requisiteValidationSchema } from '../schema/reqSchema.js';

import type { Course, CourseRequisite } from '@prisma/client';

// seutp data
export const catalogYears: string[] = JSON.parse(
  fs.readFileSync(`${apiRoot}/data/cpslo-catalog-years.json`, 'utf8')
);
export const allCourseData: Course[] = [];
for (const cYear of catalogYears) {
  const courseData: Course[] = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/courses/${cYear}/${cYear}.json`, 'utf8')
  );
  allCourseData.push(...courseData);
}

function validateCatalogCourseRequisites(catalog: string) {
  // read in req data
  console.log('validating course requisites for catalog', catalog, '\n');
  const reqCourseData: CourseRequisite[] = JSON.parse(
    fs.readFileSync(`${apiRoot}/data/courses/${catalog}/${catalog}-req.json`, 'utf8')
  );

  // do validations
  let validationErrorCount = 0;
  for (const reqData of reqCourseData) {
    const val = requisiteValidationSchema.safeParse(reqData);
    if (!val.success) {
      console.log('validation requisite data invalid for course', reqData.id, '\n');
      validationErrorCount += 1;
    }
  }

  console.log('finished validation', validationErrorCount, 'errors');
}

validateCatalogCourseRequisites('2022-2026');
