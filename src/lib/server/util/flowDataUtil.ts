import { COLORS } from '$lib/common/config/colorConfig';
import { apiData } from '$lib/server/config/apiDataConfig';
import { v4 as uuid } from 'uuid';
import { getTemplateFlowcharts } from '$lib/server/db/templateFlowchart';
import { computeTermUnits, computeTotalUnits } from '$lib/common/util/unitCounterUtilCommon';
import { generateFlowHash, mergeFlowchartsCourseData } from '$lib/common/util/flowDataUtilCommon';
import {
  CURRENT_FLOW_DATA_VERSION,
  FLOW_DEFAULT_TERM_DATA
} from '$lib/common/config/flowDataConfig';
import type { Flowchart, Term } from '$lib/common/schema/flowchartSchema';
import type { MutateFlowchartData } from '$lib/types';
import type { DBFlowchart, Program } from '@prisma/client';
import type { GenerateFlowchartData } from '$lib/server/schema/generateFlowchartSchema';

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

export async function generateFlowchart(data: GenerateFlowchartData): Promise<{
  flowchart: Flowchart;
  programMetadata: Program[];
}> {
  const templateFlowcharts = await getTemplateFlowcharts(data.programIds);

  // presumably templateFlowchart termData has been validated before being accessed here so explicitly cast
  const mergedFlowchartTermData = mergeFlowchartsCourseData(
    templateFlowcharts.map((templateFlowchart) => templateFlowchart.flowchart.termData as Term[]),
    data.programIds,
    apiData.courseData,
    apiData.programData
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
  if (data.removeGECourses) {
    for (const term of generatedFlowchart.termData) {
      const origCourseCount = term.courses.length;
      term.courses = term.courses.filter((c) => !COLORS.ge.includes(c.color));
      // recompute term units on change
      if (term.courses.length !== origCourseCount) {
        term.tUnits = computeTermUnits(
          term.courses,
          generatedFlowchart.programId,
          apiData.courseData,
          apiData.programData
        );
      }
    }
  }

  // compute total units
  generatedFlowchart.unitTotal = computeTotalUnits(
    generatedFlowchart.termData,
    apiData.courseData,
    apiData.programData,
    true,
    generatedFlowchart.programId
  );

  // compute hash
  generatedFlowchart.hash = generateFlowHash(generatedFlowchart);

  // safe to map programMetadata here (re: dedup) as request is validated to have
  // unique programIds before generating
  return {
    flowchart: generatedFlowchart,
    programMetadata: templateFlowcharts.map((data) => data.programMetadata)
  };
}
