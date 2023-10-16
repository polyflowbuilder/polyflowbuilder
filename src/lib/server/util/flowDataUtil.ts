import { COLORS } from '$lib/common/config/colorConfig';
import { v4 as uuid } from 'uuid';
import { getTemplateFlowcharts } from '$lib/server/db/templateFlowchart';
import { generateCourseCacheFlowcharts } from '$lib/server/util/courseCacheUtil';
import { computeTermUnits, computeTotalUnits } from '$lib/common/util/unitCounterUtilCommon';
import {
  generateFlowHash,
  getCatalogFromProgramID,
  mergeFlowchartsCourseData
} from '$lib/common/util/flowDataUtilCommon';
import {
  FLOW_NOTES_MAX_LENGTH,
  FLOW_DEFAULT_TERM_DATA,
  CURRENT_FLOW_DATA_VERSION
} from '$lib/common/config/flowDataConfig';
import type { DBFlowchart } from '@prisma/client';
import type { GenerateFlowchartData } from '$lib/server/schema/generateFlowchartSchema';
import type { Course, Flowchart, Term } from '$lib/common/schema/flowchartSchema';
import type { CourseCache, MutateFlowchartData, ProgramCache } from '$lib/types';

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

function generateFlowchartNotes(flowchartPrograms: ProgramCache) {
  const programNotes = Array.from(flowchartPrograms.values()).map(
    (program, i) => `- Program #${i + 1}: ${program.dataLink}`
  );

  return (
    'This is an auto-generated flowchart. Change it to fit your needs! ' +
    'The official Cal Poly flowchart PDFs for the programs in this flowchart are listed below:' +
    `\n\n${programNotes.join('\n')}\n\n` +
    'Disclaimer: This auto-generated flowchart is not an official Cal Poly flowchart, ' +
    'and it does not reflect official degree progress or information. ' +
    'Plan with care and consult an academic advisor if necessary.'
  ).slice(0, FLOW_NOTES_MAX_LENGTH);
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
  programCache: ProgramCache
): Promise<{
  flowchart: Flowchart;
  courseCache: CourseCache;
}> {
  // fetch templates
  const fetchedTemplateFlowcharts = await getTemplateFlowcharts(data.programIds);
  const templateFlowcharts = fetchedTemplateFlowcharts.map((flowchart) => {
    return {
      ...flowchart,
      programId: [flowchart.programId],
      // presumably templateFlowchart termData has been validated before being persisted to DB
      // and accessed here so safe to explicitly cast
      termData: flowchart.termData as Term[]
    };
  });

  // generate required course cache for template flowchart
  const courseCache = await generateCourseCacheFlowcharts(templateFlowcharts, programCache, true);

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
    notes: generateFlowchartNotes(programCache),
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
              `${getCatalogFromProgramID(
                generatedFlowchart.programId,
                c.programIdIndex,
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
    allRemovedCoursesKeysSet.forEach((entry) => {
      const [catalog, id] = entry.split('|');
      courseCache.delete({
        catalog,
        id
      });
    });
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
