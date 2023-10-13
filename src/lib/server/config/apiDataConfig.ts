import { prisma } from '$lib/server/db/prisma';
import { ObjectSet } from '$lib/common/util/ObjectSet';
import { initLogger } from '$lib/common/config/loggerConfig';
import type { APICourseFull, APIData } from '$lib/types';
import type { APICourse, DBNotification } from '@prisma/client';

const logger = initLogger('Config/APIDataConfig');

export const apiData: APIData = {
  catalogs: [],
  startYears: [],
  programData: [],

  courseData: new Map(),
  geCourseData: [],
  reqCourseData: []
};

export const notificationData: DBNotification[] = [];

// TODO: once we move API to another service/cache/whatnot, do a left join
// on coursedata and all metadata (ge course data, req, term typically offered, etc)
// TODO: rethink the API data so that we don't need to load all of it in like this
// for the application to run successfully
export async function init(): Promise<void> {
  logger.info('Loading API data into main memory ...');

  const dbCatalogs = await prisma.catalog.findMany();
  const dbStartYears = await prisma.startYear.findMany();
  const dbProgramData = await prisma.program.findMany();

  // use raw query here bc Prisma doesn't currently use joins
  // and raw join here is much more efficient than the auto multi-query fetch
  // for relations that Prisma uses, see here:
  // https://github.com/prisma/prisma/discussions/8840
  // https://github.com/prisma/prisma/issues/4997

  // most of the delay that comes from this is network latency and size of data
  // -- running this query on the db is almost instantaneous
  const dbCourseData: APICourseFull[] = (
    await prisma.$queryRaw<
      (APICourse & {
        termSummer: number | null;
        termFall: number | null;
        termWinter: number | null;
        termSpring: number | null;
      })[]
    >`SELECT * FROM Course LEFT JOIN TermTypicallyOffered USING (id, catalog)`
  ).map((dbCourseDataRaw) => {
    const { termSummer, termFall, termWinter, termSpring, ...crs } = dbCourseDataRaw;

    // if no tto data is present, all four entries will be null, so just pick one to check
    return {
      ...crs,
      uscpCourse: !!crs.uscpCourse,
      gwrCourse: !!crs.gwrCourse,
      dynamicTerms:
        termSummer === null
          ? null
          : {
              termSummer: !!termSummer,
              termFall: !!termFall,
              termWinter: !!termWinter,
              termSpring: !!termSpring
            }
    };
  });

  const dbGECourseData = await prisma.gECourse.findMany();
  const dbReqCourseData = await prisma.courseRequisite.findMany();

  const dbNotificationData = await prisma.dBNotification.findMany();

  // initialize program metadata
  apiData.catalogs = dbCatalogs.map((v) => v.catalog);
  apiData.startYears = dbStartYears.map((v) => v.year);
  apiData.programData = dbProgramData;

  // initialize course data
  dbCatalogs.forEach(({ catalog }) => {
    apiData.courseData.set(
      catalog,
      new ObjectSet<APICourseFull>(
        (crs) => crs.id,
        dbCourseData.filter((crs) => crs.catalog === catalog)
      )
    );
  });
  apiData.geCourseData = dbGECourseData;
  apiData.reqCourseData = dbReqCourseData;

  // init notification metadata
  for (const dbNotification of dbNotificationData) {
    notificationData.push(dbNotification);
  }

  logger.info('API data fetch complete');
}
