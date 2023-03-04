import hash from 'object-hash';
import { computeTermUnits } from '$lib/common/util/unitCounterUtilCommon';
import type { Program } from '@prisma/client';
import type { Flowchart, Term } from '$lib/common/schema/flowchartSchema';
import type { CourseCache } from '$lib/types';

// wrapper function to make sure hashes are being generated correctly in different contexts
// will take the form of [flowMetadataHash].[flowContentHash]
export function generateFlowHash(flow: Flowchart): string {
  const hashProperties: hash.NormalOption = {
    algorithm: 'md5',
    unorderedSets: true,
    unorderedObjects: true
  };

  const flowMetadataHash = hash(
    {
      name: flow.name,
      programId: flow.programId,
      startYear: flow.startYear,
      notes: flow.notes,
      version: flow.version
    },
    hashProperties
  );

  const flowCourseContentHash = hash(
    {
      termData: flow.termData,
      unitTotal: flow.unitTotal
    },
    hashProperties
  );

  return `${flowMetadataHash}.${flowCourseContentHash}`;
}

// merges all input flowchart term data given the input data, with the assumption that
// the first entry in inputFlowchartsData is the main flowchart that all others will be merged into
// assumes that all input flowcharts are nonnull
export function mergeFlowchartsCourseData(
  flowchartsTermData: Term[][],
  programIdMerged: string[],
  courseCache: CourseCache[],
  programCache: Program[],
  performCourseMerge = true
): Term[] {
  // get list of all term indexes between all valid templates
  const allTermIndexesSet = new Set<number>();
  flowchartsTermData.forEach((flowchartTermData) =>
    flowchartTermData.forEach((termData) => allTermIndexesSet.add(termData.tIndex))
  );

  // init merged term data with all present terms
  const mergedFlowchartsTermData: Term[] = Array.from(allTermIndexesSet)
    .sort((a, b) => a - b)
    .map((tIndex) => ({
      tIndex,
      tUnits: '0',
      courses: []
    }));

  // merge each term, one input flowchart at a time
  const courseIdsSet = new Set<string>();
  for (let i = 0; i < flowchartsTermData.length; i += 1) {
    const flowchartTermData = flowchartsTermData[i];
    for (const termData of flowchartTermData) {
      // get term index in merged set associated with the current term
      const mergedTermDataIdx = mergedFlowchartsTermData.findIndex(
        (mergedTermData) => mergedTermData.tIndex === termData.tIndex
      );

      // if we don't have performCourseMerge, will let all courses thru
      // always merge courses with null ID
      const coursesToMerge = termData.courses.filter(
        (crs) => crs.id === null || !courseIdsSet.has(crs.id)
      );

      // then perform the merge
      mergedFlowchartsTermData[mergedTermDataIdx].courses = [
        ...mergedFlowchartsTermData[mergedTermDataIdx].courses,
        ...coursesToMerge.map((crs) => {
          // only include programIdIndex if it's nonzero
          if (i) {
            crs.programIdIndex = i;
          } else {
            delete crs.programIdIndex;
          }
          return crs;
        })
      ];

      // update dedupe list if enabled - dont add nulls
      if (performCourseMerge) {
        coursesToMerge.forEach((crs) => {
          if (crs.id) {
            courseIdsSet.add(crs.id);
          }
        });
      }
    }
  }

  // once course merge finish, update units
  for (const mergedTermData of mergedFlowchartsTermData) {
    mergedTermData.tUnits = computeTermUnits(
      mergedTermData.courses,
      programIdMerged,
      courseCache,
      programCache
    );
  }

  return mergedFlowchartsTermData;
}
