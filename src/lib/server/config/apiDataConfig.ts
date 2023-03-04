import { prisma } from '$lib/server/db/prisma';
import { initLogger } from '$lib/common/config/loggerConfig';
import type { APIData } from '$lib/types';

const logger = initLogger('Config/APIDataConfig');

export const apiData: APIData = {
  catalogs: [],
  startYears: [],
  programData: [],

  courseData: [],
  geCourseData: [],
  reqCourseData: []
};

// TODO: once we move API to another service/cache/whatnot, do a left join
// on coursedata and all metadata (ge course data, req, term typically offered, etc)
export async function init(): Promise<void> {
  logger.info('Loading API data into main memory ...');

  const dbCatalogs = await prisma.catalog.findMany();
  const dbStartYears = await prisma.startYear.findMany();
  const dbProgramData = await prisma.program.findMany();
  const dbCourseData = await prisma.aPICourse.findMany();
  const dbGECourseData = await prisma.gECourse.findMany();
  const dbReqCourseData = await prisma.courseRequisite.findMany();

  // initialize program metadata
  apiData.catalogs = dbCatalogs.map((v) => v.catalog);
  apiData.startYears = dbStartYears.map((v) => v.year);
  apiData.programData = dbProgramData;

  // initialize course data
  apiData.courseData = dbCatalogs.map(({ catalog }) => ({
    catalog,
    courses: dbCourseData.filter((crs) => crs.catalog === catalog)
  }));
  apiData.geCourseData = dbGECourseData;
  apiData.reqCourseData = dbReqCourseData;

  logger.info('API data fetch complete');
}
