import { prisma } from '$lib/server/db/prisma';
import { Prisma } from '@prisma/client';
import type { APICourse } from '@prisma/client';
import type { APICourseFull } from '$lib/types';

export async function getCourseData(
  searchCourses: {
    id: string;
    catalog: string;
  }[]
): Promise<APICourseFull[]> {
  const inputCourses = searchCourses.map(
    (searchCourse) => Prisma.sql`(${Prisma.join([searchCourse.id, searchCourse.catalog])})`
  );

  // use raw query here bc Prisma doesn't currently use joins
  // and raw join here is much more efficient than the auto multi-query fetch
  // for relations that Prisma uses, see here:
  // https://github.com/prisma/prisma/discussions/8840
  // https://github.com/prisma/prisma/issues/4997

  // most of the delay that comes from this is network latency and size of data
  // -- running this query on the db is almost instantaneous

  // fetch the courses from the DB
  // ternary to make sure we only query if we have courses to query for
  return inputCourses.length
    ? (
        await prisma.$queryRaw<
          (APICourse & {
            termSummer: number | null;
            termFall: number | null;
            termWinter: number | null;
            termSpring: number | null;
          })[]
        >`SELECT * FROM Course LEFT JOIN TermTypicallyOffered USING (id, catalog) WHERE (id, catalog) IN (${Prisma.join(
          inputCourses
        )})`
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
      })
    : [];
}
