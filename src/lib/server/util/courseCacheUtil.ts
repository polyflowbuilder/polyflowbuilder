import { getCourseData } from '$lib/server/db/course';
import { getCatalogFromProgramIDIndex } from '$lib/common/util/courseDataUtilCommon';
import type { Program } from '@prisma/client';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { CourseCache } from '$lib/types';

export async function generateCourseCacheFlowchart(
  flowchart: Flowchart,
  programCache: Program[]
): Promise<CourseCache[]> {
  const catalogs = [...new Set(programCache.map((prog) => prog.catalog))];
  const flowchartCourseCache: CourseCache[] = catalogs.map((catalog) => {
    return {
      catalog,
      courses: []
    };
  });
  // only keep the IDs in here vs. the entire course object so === equality works properly
  const courseIds = new Set<string>();

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

        // dedup to ensure we only request one lookup per unique course
        courseIds.add(`${courseCatalog},${c.id}`);
      }
    });
  });

  // get the courses
  const courses = await getCourseData(
    [...courseIds].map((courseId) => {
      const parts = courseId.split(',');
      return {
        catalog: parts[0],
        id: parts[1]
      };
    })
  );

  // map courses to course cache
  courses.forEach((crs) => {
    const idx = catalogs.findIndex((catalog) => catalog === crs.catalog);
    if (idx === -1) {
      throw new Error('courseCacheUtil: undefined catalog in courseCache Set');
    }

    flowchartCourseCache[idx].courses.push(crs);
  });

  return flowchartCourseCache;
}

export async function generateUserCourseCache(
  userFlowcharts: Flowchart[],
  programCache: Program[]
): Promise<CourseCache[]> {
  const catalogs = [...new Set(programCache.map((prog) => prog.catalog))];
  const userCourseCache: CourseCache[] = catalogs.map((catalog) => {
    return {
      catalog,
      courses: []
    };
  });
  // only keep the IDs in here vs. the entire course object so === equality works properly
  const courseCacheSets = catalogs.map(() => new Set<string>());

  // TODO: can we optimize this? O(mnp)
  for await (const flow of userFlowcharts) {
    const flowchartCourseCacheData = await generateCourseCacheFlowchart(flow, programCache);
    flowchartCourseCacheData.forEach((flowchartCourseCacheDataCatalog, i) => {
      flowchartCourseCacheDataCatalog.courses.forEach((crs) => {
        if (!courseCacheSets[i].has(`${crs.catalog},${crs.id}`)) {
          courseCacheSets[i].add(`${crs.catalog},${crs.id}`);
          userCourseCache[i].courses.push(crs);
        }
      });
    });
  }

  return userCourseCache;
}
