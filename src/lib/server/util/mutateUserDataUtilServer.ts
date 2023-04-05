// util functions for persisting user data changes to backend

import { mutateUserFlowcharts } from '$lib/common/util/mutateUserDataUtilCommon';
import { UserDataUpdateChunkType } from '$lib/common/schema/mutateUserDataSchema';
import { getUserFlowcharts, updateFlowcharts } from '$lib/server/db/flowchart';
import type { UserDataUpdateChunk } from '$lib/common/schema/mutateUserDataSchema';

// returns an array of flow uuids to fetch from backend
// if returned array is empty, will fetch all of users' flows
function getFlowchartModifyIdsFromChunkList(chunksList: UserDataUpdateChunk[]): string[] {
  // get Ids of flowcharts to be modified
  const flowchartModifyIds = new Set<string>();

  chunksList.forEach((chunk) => {
    switch (chunk.type) {
      case UserDataUpdateChunkType.FLOW_LIST_CHANGE:
        break;
      // add other cases in the future
    }
  });

  return Array.from(flowchartModifyIds);
}

export async function persistUserDataChangesServer(
  userId: string,
  chunksList: UserDataUpdateChunk[]
): Promise<boolean> {
  // get flowcharts to modify from chunks
  const flowchartModifyIds = getFlowchartModifyIdsFromChunkList(chunksList);
  const userFlowchartsData = await getUserFlowcharts(userId, flowchartModifyIds);

  // perform updates
  const mutatedUserFlowchartsData = mutateUserFlowcharts(userFlowchartsData, chunksList);

  // persist updated flowcharts to database
  return await updateFlowcharts(mutatedUserFlowchartsData);
}
