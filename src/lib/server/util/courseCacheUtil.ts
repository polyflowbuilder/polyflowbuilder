import { apiData } from '$lib/server/config/apiDataConfig';
import { getCatalogFromProgramIDIndex } from '$lib/common/util/courseDataUtilCommon';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { APICourseFull, CourseCache } from '$lib/types';

export function generateCourseCacheFlowchart(flowchart: Flowchart): CourseCache[] {
  const flowchartCourseCache: CourseCache[] = apiData.catalogs.map((catalog) => ({
    catalog,
    courses: []
  }));

  flowchart.termData.forEach((termData) => {
    termData.courses.forEach((c) => {
      // skip all custom courses
      // TODO: optimize the courses data structure to use lookups instead of find() operations?
      if (c.id) {
        // select the correct catalog
        const courseCatalog = getCatalogFromProgramIDIndex(
          c.programIdIndex ?? 0,
          flowchart.programId,
          apiData.programData
        );

        if (!courseCatalog) {
          throw new Error('courseCacheUtil: undefined courseCatalog');
        }

        // get the associated course data
        const courseMetadata = apiData.courseData
          .find((cache) => cache.catalog === courseCatalog)
          ?.courses.find((crs) => crs.id === c.id);

        const catalogCourseCache = flowchartCourseCache.find(
          (cache) => cache.catalog === courseCatalog
        )?.courses;

        if (!catalogCourseCache) {
          throw new Error('courseCacheUtil: undefined catalog in course cache');
        }

        if (courseMetadata) {
          catalogCourseCache.push(courseMetadata);
        }
      }
    });
  });

  return flowchartCourseCache;
}

export function generateUserCourseCache(userFlowcharts: Flowchart[]): CourseCache[] {
  const courseCacheSets: Set<APICourseFull>[] = apiData.catalogs.map(() => new Set());

  // TODO: can we optimize this? O(n^3)
  userFlowcharts.forEach((flow) => {
    const flowchartCourseCacheData = generateCourseCacheFlowchart(flow);
    flowchartCourseCacheData.forEach((flowchartCourseCacheDataCatalog, i) => {
      flowchartCourseCacheDataCatalog.courses.forEach((crs) => {
        courseCacheSets[i].add(crs);
      });
    });
  });

  const userCourseCache: CourseCache[] = [];
  apiData.catalogs.forEach((catalog, i) =>
    userCourseCache.push({
      catalog,
      courses: Array.from(courseCacheSets[i])
    })
  );

  return userCourseCache;
}
