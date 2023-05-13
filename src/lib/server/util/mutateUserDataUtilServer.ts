// util functions for persisting user data changes to backend

import { apiData } from '../config/apiDataConfig';
import { initLogger } from '$lib/common/config/loggerConfig';
import { mutateUserFlowcharts } from '$lib/common/util/mutateUserDataUtilCommon';
import { UserDataUpdateChunkType } from '$lib/types';
import { deleteFlowcharts, getUserFlowcharts, upsertFlowcharts } from '$lib/server/db/flowchart';
import type { UserDataUpdateChunk } from '$lib/common/schema/mutateUserDataSchema';

const logger = initLogger('Util/MutateUserDataUtilServer');

// returns an array of flow uuids to fetch from backend
// if returned array is empty, will fetch all of users' flows
function getFlowchartModifyIdsFromChunkList(chunksList: UserDataUpdateChunk[]): string[] {
  // get Ids of flowcharts to be modified
  const flowchartModifyIds = new Set<string>();

  chunksList.forEach((chunk) => {
    switch (chunk.type) {
      case UserDataUpdateChunkType.FLOW_LIST_CHANGE: {
        chunk.data.order.forEach((flowPosEntry) => {
          flowchartModifyIds.add(flowPosEntry.id);
        });
        break;
      }
      case UserDataUpdateChunkType.FLOW_UPSERT_ALL: {
        flowchartModifyIds.add(chunk.data.flowchart.id);
        break;
      }
      case UserDataUpdateChunkType.FLOW_DELETE: {
        flowchartModifyIds.add(chunk.data.id);
        break;
      }
      case UserDataUpdateChunkType.FLOW_TERM_MOD: {
        flowchartModifyIds.add(chunk.data.id);
        break;
      }
    }
  });

  return Array.from(flowchartModifyIds);
}

// persists changes listed in update chunks to backend
// returns boolean for whether this was successful or not
// if NOT successful, this is assumed to be a 4xx failure due to
// bad input payload and NOT internal server errors -- for those, will throw errors
export async function persistUserDataChangesServer(
  userId: string,
  chunksList: UserDataUpdateChunk[]
): Promise<boolean> {
  // get flowcharts to modify from chunks
  const flowchartModifyIds = getFlowchartModifyIdsFromChunkList(chunksList);
  const userFlowchartsData = await getUserFlowcharts(userId, flowchartModifyIds);

  // perform updates
  const mutateUserFlowchartsResult = mutateUserFlowcharts(
    userFlowchartsData,
    chunksList,
    apiData.courseData,
    apiData.programData
  );

  if (!mutateUserFlowchartsResult.success) {
    logger.warn(
      'mutateUserFlowcharts operation failed in persistUserDataChangesServer due to the following errors:',
      mutateUserFlowchartsResult.errors
    );
    return false;
  }

  logger.info(
    `Applied updates [${chunksList.map(
      (chunk) => UserDataUpdateChunkType[chunk.type]
    )}] to flowcharts [${flowchartModifyIds}]`
  );

  // persist updated flowcharts to database if flow mutation successful
  // do it this way since multiple chunks may come in that do deletes and updates
  const updatedFlowchartIdsSet = new Set(
    mutateUserFlowchartsResult.flowchartsData.map((flow) => flow.flowchart.id)
  );
  const deletedFlowchartIds = flowchartModifyIds.filter((id) => !updatedFlowchartIdsSet.has(id));

  if (deletedFlowchartIds.length) {
    await deleteFlowcharts(deletedFlowchartIds);
  }
  if (updatedFlowchartIdsSet.size) {
    await upsertFlowcharts(mutateUserFlowchartsResult.flowchartsData);
  }

  return true;
}
