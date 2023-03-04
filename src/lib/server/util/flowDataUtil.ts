import { COLORS } from '$lib/common/config/colorConfig';
import { apiData } from '$lib/server/config/apiDataConfig';
import { v4 as uuid } from 'uuid';
import { getTemplateFlowcharts } from '$lib/server/db/templateFlowchart';
import { computeTotalUnits } from '$lib/common/util/unitCounterUtilCommon';
import { generateFlowHash, mergeFlowchartsCourseData } from '$lib/common/util/flowDataUtilCommon';
import {
  CURRENT_FLOW_DATA_VERSION,
  FLOW_DEFAULT_TERM_DATA
} from '$lib/common/config/flowDataConfig';
import type { DBFlowchart } from '@prisma/client';
import type { Flowchart, Term } from '$lib/common/schema/flowchartSchema';
import type { GenerateFlowchartData } from '$lib/server/schema/generateFlowchartSchema';

export function convertDBFlowchartToFlowchart(flowchart: DBFlowchart): Flowchart {
  const {
    programId1,
    programId2,
    programId3,
    programId4,
    programId5,
    validationData,
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
    lastUpdatedUTC: flowchart.lastUpdatedUTC as Date,
    ...(validationData && { validationData })
  };

  return convertedFlowchart;
}

export function convertFlowchartToDBFlowchart(flowchart: Flowchart): DBFlowchart {
  const { programId, ...userFlowchart } = flowchart;

  const convertedFlowchart: DBFlowchart = {
    ...userFlowchart,
    programId1: programId[0],
    programId2: programId[1] ?? null,
    programId3: programId[2] ?? null,
    programId4: programId[3] ?? null,
    programId5: programId[4] ?? null,
    validationData: flowchart.validationData ?? null
  };

  return convertedFlowchart;
}

export async function generateFlowchart(data: GenerateFlowchartData): Promise<Flowchart> {
  const templateFlowcharts = await getTemplateFlowcharts(data.programIds);

  // presumably templateFlowchart termData has been validated before being accessed here so explicitly cast
  const mergedFlowchartTermData = mergeFlowchartsCourseData(
    templateFlowcharts.map((templateFlowchart) => templateFlowchart.termData as Term[]),
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
    for (let i = 0; i < generatedFlowchart.termData.length; i += 1) {
      generatedFlowchart.termData[i].courses = generatedFlowchart.termData[i].courses.filter(
        (c) => !COLORS.ge.includes(c.color)
      );
    }
  }

  // compute term units
  generatedFlowchart.unitTotal = computeTotalUnits(
    generatedFlowchart.termData,
    apiData.courseData,
    apiData.programData,
    true,
    data.programIds
  );

  // compute hash
  generatedFlowchart.hash = generateFlowHash(generatedFlowchart);

  return generatedFlowchart;
}
