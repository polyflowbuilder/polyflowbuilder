import { getCourseData } from '$lib/server/db/course';
import { getCatalogFromProgramIDIndex } from '$lib/common/util/courseDataUtilCommon';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { Program } from '@prisma/client';
import type { APICourseFull, CourseCache } from '$lib/types';

export async function generateCourseCacheFlowchart(
  flowchart: Flowchart,
  programCache: Program[]
): Promise<CourseCache[]> {
  const catalogs = [...new Set(programCache.map((prog) => prog.catalog))];
  const courseCacheSets: Set<APICourseFull>[] = catalogs.map(() => new Set());

  // gather courses that need to be fetched
  const courseIds: {
    id: string;
    catalog: string;
  }[] = [];

  flowchart.termData.forEach((termData) => {
    termData.courses.forEach((c) => {
      // skip all custom courses
      // TODO: optimize the courses data structure to use lookups instead of find() operations?
      if (c.id) {
        // select the correct catalog
        const courseCatalog = getCatalogFromProgramIDIndex(
          c.programIdIndex ?? 0,
          flowchart.programId,
          programCache
        );

        if (!courseCatalog) {
          throw new Error('courseCacheUtil: undefined courseCatalog');
        }

        courseIds.push({
          id: c.id,
          catalog: courseCatalog
        });
      }
    });
  });

  // get the courses
  const courses = await getCourseData(courseIds);

  // map courses to course cache
  courses.forEach((crs) => {
    const idx = catalogs.findIndex((catalog) => catalog === crs.catalog);
    if (idx === -1) {
      throw new Error('courseCacheUtil: undefined catalog in courseCache Set');
    }

    courseCacheSets[idx].add(crs);
  });

  const flowchartCourseCache: CourseCache[] = [];
  catalogs.forEach((catalog, i) =>
    flowchartCourseCache.push({
      catalog,
      courses: Array.from(courseCacheSets[i])
    })
  );
  return flowchartCourseCache;
}

export async function generateUserCourseCache(
  userFlowcharts: Flowchart[],
  programCache: Program[]
): Promise<CourseCache[]> {
  const catalogs = [...new Set(programCache.map((prog) => prog.catalog))];
  const courseCacheSets: Set<APICourseFull>[] = catalogs.map(() => new Set());

  // TODO: can we optimize this? O(n^3)
  for await (const flow of userFlowcharts) {
    const flowchartCourseCacheData = await generateCourseCacheFlowchart(flow, programCache);
    flowchartCourseCacheData.forEach((flowchartCourseCacheDataCatalog, i) => {
      flowchartCourseCacheDataCatalog.courses.forEach((crs) => {
        courseCacheSets[i].add(crs);
      });
    });
  }

  const userCourseCache: CourseCache[] = [];
  catalogs.forEach((catalog, i) =>
    userCourseCache.push({
      catalog,
      courses: Array.from(courseCacheSets[i])
    })
  );

  return userCourseCache;
}
