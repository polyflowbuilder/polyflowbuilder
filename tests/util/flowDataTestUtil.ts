import type { DBFlowchart } from '@prisma/client';
import type { Flowchart, Term } from '$lib/common/schema/flowchartSchema';

// TODO: figure out how we can import from flowDataUtil in SK without
// playwright complaining about (doesn't know how to resolve $lib)
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
