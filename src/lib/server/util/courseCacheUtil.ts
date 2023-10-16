import { ObjectMap } from '$lib/common/util/ObjectMap';
import { initLogger } from '$lib/common/config/loggerConfig';
import { getCourseData } from '$lib/server/db/course';
import { getCatalogFromProgramIDIndex } from '$lib/common/util/courseDataUtilCommon';
import { UserDataUpdateChunkType, UserDataUpdateChunkTERM_MODCourseDataFrom } from '$lib/types';
import type { UserDataUpdateChunk } from '$lib/common/schema/mutateUserDataSchema';
import type { Course, Flowchart, Term } from '$lib/common/schema/flowchartSchema';
import type { CourseCache, ProgramCache } from '$lib/types';

const logger = initLogger('Util/CourseCacheUtil');

export async function generateCourseCacheFlowcharts(
  // smaller type than full Flowchart so we can pass TemplateFlowchart
  // information into here as well
  flowcharts: {
    programId: string[];
    termData: Term[];
  }[],
  programCache: ProgramCache,
  // for merge use cases e.g. generateFlowchart
  enforceUniqueCoursesAcrossCaches = false
): Promise<CourseCache> {
  const flowchartCourseCache: CourseCache = new ObjectMap();

  // only keep the IDs in here vs. the entire course object so === equality works properly
  const courseCatalogAndIds = new Set<string>();
  const courseIds = new Set<string>();

  flowcharts.forEach((flowchart) => {
    flowchart.termData.forEach((termData) => {
      termData.courses.forEach((c) => {
        // skip all custom courses
        if (c.id) {
          // select the correct catalog
          const courseCatalog = getCatalogFromProgramIDIndex(
            c.programIdIndex,
            flowchart.programId,
            programCache
          );

          if (!courseCatalog) {
            throw new Error('courseCacheUtil: undefined courseCatalog');
          }

          // dedup to ensure we only request one lookup per unique course
          if (!courseIds.has(c.id)) {
            courseCatalogAndIds.add(`${courseCatalog},${c.id}`);
          }
          if (enforceUniqueCoursesAcrossCaches) {
            courseIds.add(c.id);
          }
        }
      });
    });
  });

  // get the courses
  const courses = await getCourseData(
    [...courseCatalogAndIds].map((courseId) => {
      const parts = courseId.split(',');
      return {
        catalog: parts[0],
        id: parts[1]
      };
    })
  );

  // map courses to course cache
  courses.forEach((crs) => {
    flowchartCourseCache.set(
      {
        catalog: crs.catalog,
        id: crs.id
      },
      crs
    );
  });

  return flowchartCourseCache;
}

// TODO: add tests? - the functionality here is already covered
// by e2e tests (eg flowTermModApiTests) so not sure if explicit
// unit tests are required
export async function generateCourseCacheFromUpdateChunks(
  flowcharts: Flowchart[],
  chunksList: UserDataUpdateChunk[],
  programCache: ProgramCache
): Promise<CourseCache | undefined> {
  const flowchartCourseCache: CourseCache = new ObjectMap();

  // only keep the IDs in here vs. the entire course object so === equality works properly
  const courseCatalogAndIds = new Set<string>();

  // TERM_MOD is the only update chunk that currently needs course data
  // so fetch course info for all non-custom courses in all TERM_MOD update chunks
  for (let chunkIdx = 0; chunkIdx < chunksList.length; chunkIdx += 1) {
    const chunk = chunksList[chunkIdx];
    if (chunk.type === UserDataUpdateChunkType.FLOW_TERM_MOD) {
      const flowchart = flowcharts.find((flowchart) => flowchart.id === chunk.data.id);

      // can happen if bad data is passed in
      if (!flowchart) {
        logger.warn(
          `generateCourseCacheFromUpdateChunks: unable to find flowchart with id ${chunk.data.id}`
        );
        return undefined;
      }

      for (let courseDiffIdx = 0; courseDiffIdx < chunk.data.termData.length; courseDiffIdx += 1) {
        const courseDiff = chunk.data.termData[courseDiffIdx];

        // get course information
        let course: Course | undefined = undefined;
        if (courseDiff.from === UserDataUpdateChunkTERM_MODCourseDataFrom.EXISTING) {
          const term = flowchart.termData.find((term) => term.tIndex === courseDiff.data.tIndex);
          course = term?.courses[courseDiff.data.cIndex];
        } else {
          course = courseDiff.data;
        }

        // can happen if bad data is passed in
        if (!course) {
          logger.warn(
            `generateCourseCacheFromUpdateChunks: unable to find course in update chunk ${chunkIdx} courseDiff ${courseDiffIdx}`
          );
          return undefined;
        }

        // add course to cache only if noncustom
        if (course.id) {
          const courseCatalog = getCatalogFromProgramIDIndex(
            course.programIdIndex,
            flowchart.programId,
            programCache
          );

          // can happen if bad data is passed in
          if (!courseCatalog) {
            logger.warn(
              `generateCourseCacheFromUpdateChunks: program with index ${
                course.programIdIndex
              } does not exist in programIds list ${flowchart.programId.join(',')}`
            );
            return undefined;
          }

          courseCatalogAndIds.add(`${courseCatalog},${course.id}`);
        }
      }
    }
  }

  // get the courses
  const courses = await getCourseData(
    [...courseCatalogAndIds].map((courseId) => {
      const parts = courseId.split(',');
      return {
        catalog: parts[0],
        id: parts[1]
      };
    })
  );

  // map courses to course cache
  courses.forEach((crs) => {
    flowchartCourseCache.set(
      {
        catalog: crs.catalog,
        id: crs.id
      },
      crs
    );
  });

  return flowchartCourseCache;
}
