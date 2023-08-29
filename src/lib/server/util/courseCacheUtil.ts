import { getCourseData } from '$lib/server/db/course';
import { getCatalogFromProgramIDIndex } from '$lib/common/util/courseDataUtilCommon';
import type { Program } from '@prisma/client';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { CourseCache } from '$lib/types';

export async function generateCourseCacheFlowcharts(
  flowcharts: Flowchart[],
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

  flowcharts.forEach((flowchart) => {
    flowchart.termData.forEach((termData) => {
      termData.courses.forEach((c) => {
        // skip all custom courses
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

  // only return caches that have courses in them
  return flowchartCourseCache.filter((cache) => cache.courses.length);
}
