import { COLORS } from '$lib/common/config/colorConfig';
import { v4 as uuid } from 'uuid';
import { getTemplateFlowcharts } from '$lib/server/db/templateFlowchart';
import { getCatalogFromProgramIDIndex } from '$lib/common/util/courseDataUtilCommon';
import { generateCourseCacheFlowcharts } from './courseCacheUtil';
import { computeTermUnits, computeTotalUnits } from '$lib/common/util/unitCounterUtilCommon';
import { generateFlowHash, mergeFlowchartsCourseData } from '$lib/common/util/flowDataUtilCommon';
import {
  CURRENT_FLOW_DATA_VERSION,
  FLOW_DEFAULT_TERM_DATA
} from '$lib/common/config/flowDataConfig';
import type { DBFlowchart, Program } from '@prisma/client';
import type { GenerateFlowchartData } from '$lib/server/schema/generateFlowchartSchema';
import type { Course, Flowchart, Term } from '$lib/common/schema/flowchartSchema';
import type { CourseCache, MutateFlowchartData } from '$lib/types';

export function convertDBFlowchartToFlowchart(flowchart: DBFlowchart): MutateFlowchartData {
  const {
    programId1,
    programId2,
    programId3,
    programId4,
    programId5,
    validationData,
    pos,
    ...dbFlowchart
  } = flowchart;

  const convertedFlowchart: Flowchart = {
    ...dbFlowchart,
    programId: [programId1, programId2, programId3, programId4, programId5].filter(
      (prog) => prog !== null
    ) as string[],
    termData: flowchart.termData as Term[],
    // Prisma schema marked as Date|null, but only bc it can be left out
    // when passing flowchart update data - the actual date will always
    // be present in the DB, so safe to make this typecast
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    lastUpdatedUTC: flowchart.lastUpdatedUTC as Date,
    ...(validationData && { validationData })
  };

  return {
    flowchart: convertedFlowchart,
    pos
  };
}

export function convertFlowchartToDBFlowchart(flowchartData: MutateFlowchartData): DBFlowchart {
  const { programId, ...userFlowchart } = flowchartData.flowchart;

  const convertedFlowchart: DBFlowchart = {
    ...userFlowchart,
    programId1: programId[0],
    programId2: programId[1] ?? null,
    programId3: programId[2] ?? null,
    programId4: programId[3] ?? null,
    programId5: programId[4] ?? null,
    validationData: flowchartData.flowchart.validationData ?? null,
    pos: flowchartData.pos
  };

  return convertedFlowchart;
}

export async function generateFlowchart(
  data: GenerateFlowchartData,
  programCache: Program[]
): Promise<{
  flowchart: Flowchart;
  courseCache: CourseCache[];
}> {
  // fetch required data
  // presumably templateFlowchart termData has been validated before being persisted to DB
  // and accessed here so safe to explicitly cast
  const templateFlowcharts = (await getTemplateFlowcharts(data.programIds)).map((flowchart) => {
    return {
      ...flowchart,
      programId: [flowchart.programId],
      termData: flowchart.termData as Term[]
    };
  });
  let courseCache = await generateCourseCacheFlowcharts(templateFlowcharts, programCache, true);

  const mergedFlowchartTermData = mergeFlowchartsCourseData(
    templateFlowcharts.map((templateFlowchart) => templateFlowchart.termData),
    data.programIds,
    courseCache,
    programCache
  );

  // actually create the flowchart
  const generatedFlowchart: Flowchart = {
    id: uuid(),
    ownerId: data.ownerId,
    name: data.name,
    programId: data.programIds,
    startYear: data.startYear,
    termData: mergedFlowchartTermData.length ? mergedFlowchartTermData : FLOW_DEFAULT_TERM_DATA,
    unitTotal: '0',
    notes: '',
    version: CURRENT_FLOW_DATA_VERSION,
    hash: '',
    publishedId: null,
    importedId: null,
    lastUpdatedUTC: new Date()
  };

  // process options

  // TODO: optimize
  if (data.removeGECourses) {
    const allRemovedCoursesKeysSet = new Set<string>();
    for (const term of generatedFlowchart.termData) {
      const notRemovedCourses: Course[] = [];
      term.courses.forEach((c) => {
        if (COLORS.ge.includes(c.color)) {
          // some GE courses may be custom so
          // they dont need to be removed from courseCache
          if (c.id) {
            allRemovedCoursesKeysSet.add(
              `${getCatalogFromProgramIDIndex(
                c.programIdIndex ?? 0,
                generatedFlowchart.programId,
                programCache
              )}|${c.id}`
            );
          }
        } else {
          notRemovedCourses.push(c);
        }
      });

      // recompute term data if applicable
      if (term.courses.length !== notRemovedCourses.length) {
        term.courses = notRemovedCourses;
        term.tUnits = computeTermUnits(
          term.courses,
          generatedFlowchart.programId,
          courseCache,
          programCache
        );
      }
    }

    // recompute course cache if applicable
    if (allRemovedCoursesKeysSet.size) {
      courseCache = courseCache.map((cache) => {
        return {
          catalog: cache.catalog,
          courses: cache.courses.filter(
            (crs) => !allRemovedCoursesKeysSet.has(`${crs.catalog}|${crs.id}`)
          )
        };
      });
    }
  }

  // compute total units
  generatedFlowchart.unitTotal = computeTotalUnits(
    generatedFlowchart.termData,
    courseCache,
    programCache,
    true,
    generatedFlowchart.programId
  );

  // compute hash
  generatedFlowchart.hash = generateFlowHash(generatedFlowchart);

  return {
    flowchart: generatedFlowchart,
    courseCache
  };
}
