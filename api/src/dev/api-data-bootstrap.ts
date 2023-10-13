// load API data from FS instead of from database
// should only be used in development/test environments
// models apiDataConfig in SK app

// TODO: if we need to use this, integrate with existing apiDataConfig and add
// option to load from FS instead of DB

import fs from 'fs';
import { ObjectSet } from '$lib/common/util/ObjectSet';
import type { APICourseFull, APIData } from '$lib/types';
import type {
  Program,
  GECourse,
  APICourse,
  DBNotification,
  CourseRequisite,
  TermTypicallyOffered
} from '@prisma/client';

export const API_DATA_ROOT = '../../';

export const apiData: APIData = {
  catalogs: [],
  startYears: [],
  programData: [],

  courseData: new Map(),
  geCourseData: [],
  reqCourseData: []
};

export const notificationData: DBNotification[] = [];

export function init() {
  console.log('start api-data-bootstrap ...');

  // read in files
  apiData.catalogs = JSON.parse(
    fs.readFileSync(`${API_DATA_ROOT}/cpslo-catalog-years.json`, 'utf8')
  ) as string[];

  apiData.startYears = JSON.parse(
    fs.readFileSync(`${API_DATA_ROOT}/cpslo-start-years.json`, 'utf8')
  ) as string[];

  apiData.programData = (
    JSON.parse(fs.readFileSync(`${API_DATA_ROOT}/cpslo-template-flow-data.json`, 'utf8')) as {
      flows: Program[];
      cSheets: Program[];
    }
  ).flows;

  const termTypicallyOffered = JSON.parse(
    fs.readFileSync(`${API_DATA_ROOT}/cpslo-term-typically-offered.json`, 'utf8')
  ) as TermTypicallyOffered[];

  // read in course data
  for (const catalog of apiData.catalogs) {
    console.log('loading catalog data for year', catalog);

    const courses = JSON.parse(
      fs.readFileSync(`${API_DATA_ROOT}/data/courses/${catalog}/${catalog}.json`, 'utf8')
    ) as APICourse[];
    const geCourses: GECourse[] = JSON.parse(
      fs.readFileSync(`${API_DATA_ROOT}/courses/${catalog}/${catalog}-GE.json`, 'utf8')
    ) as GECourse[];
    const reqCourseData: CourseRequisite[] = JSON.parse(
      fs.readFileSync(`${API_DATA_ROOT}/courses/${catalog}/${catalog}-req.json`, 'utf8')
    ) as CourseRequisite[];

    // load static course override data if present and update
    if (fs.existsSync(`${API_DATA_ROOT}/courses/${catalog}/${catalog}-override.json`)) {
      const overrideCourseList: APICourse[] = JSON.parse(
        fs.readFileSync(`${API_DATA_ROOT}/courses/${catalog}/${catalog}-override.json`, 'utf8')
      ) as APICourse[];

      overrideCourseList.forEach((course: APICourse) => {
        const overrideIndex = courses.findIndex((cObj) => cObj.id === course.id);
        courses[overrideIndex] = course;
      });
      console.log(
        'Nonempty API course override data list found and applied to',
        catalog,
        'catalog; Updated entries:',
        overrideCourseList.length
      );
    }

    // add loaded data to apiData
    apiData.courseData.set(
      catalog,
      new ObjectSet<APICourseFull>(
        (crs) => crs.id,
        courses.map((crs) => {
          const ttoData = termTypicallyOffered.find(
            (ttoCourse) => ttoCourse.catalog === crs.catalog && ttoCourse.id === crs.id
          );
          return {
            ...crs,
            dynamicTerms: ttoData
              ? {
                  termFall: ttoData.termFall,
                  termWinter: ttoData.termWinter,
                  termSpring: ttoData.termSpring,
                  termSummer: ttoData.termSummer
                }
              : null
          };
        })
      )
    );
    apiData.geCourseData.push(...geCourses);
    apiData.reqCourseData.push(...reqCourseData);
  }

  console.log('api-data-bootstrap complete');
}
