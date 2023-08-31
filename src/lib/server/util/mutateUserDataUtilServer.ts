// util functions for persisting user data changes to backend

import { initLogger } from '$lib/common/config/loggerConfig';
import { mutateUserFlowcharts } from '$lib/common/util/mutateUserDataUtilCommon';
import { UserDataUpdateChunkType } from '$lib/types';
import { generateCourseCacheFromUpdateChunks } from '$lib/server/util/courseCacheUtil';
import { deleteFlowcharts, getUserFlowcharts, upsertFlowcharts } from '$lib/server/db/flowchart';
import type { Program } from '@prisma/client';
import type { UserDataUpdateChunk } from '$lib/common/schema/mutateUserDataSchema';
import type { MutateFlowchartData } from '$lib/types';

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
      // TODO: default case?
      case UserDataUpdateChunkType.FLOW_DELETE: {
        flowchartModifyIds.add(chunk.data.id);
        break;
      }
      case UserDataUpdateChunkType.FLOW_TERM_MOD: {
        flowchartModifyIds.add(chunk.data.id);
        break;
      }
      case UserDataUpdateChunkType.FLOW_TERMS_ADD: {
        flowchartModifyIds.add(chunk.data.id);
        break;
      }
      case UserDataUpdateChunkType.FLOW_TERMS_DELETE: {
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
  const userFlowchartsData = await getUserFlowcharts(userId, flowchartModifyIds, true);
  const flowchartMutationData: MutateFlowchartData[] = [];
  const programCache: Program[] = [];

  userFlowchartsData.forEach((data) => {
    flowchartMutationData.push({
      flowchart: data.flowchart,
      pos: data.pos
    });
    // to satisfy type checking
    if (data.programMetadata) {
      programCache.push(...data.programMetadata);
    }
  });

  // make sure we were able to get all flowcharts
  if (flowchartMutationData.length !== flowchartModifyIds.length) {
    logger.warn('Failed to find all requested flowcharts for mutateUserFlowcharts operation');
    return false;
  }

  // get course caches for modify
  const courseCache = await generateCourseCacheFromUpdateChunks(
    flowchartMutationData.map(({ flowchart }) => flowchart),
    chunksList,
    programCache
  );

  // make sure course cache generation was successful
  if (!courseCache) {
    logger.warn('Failed to generate course cache for mutateUserFlowcharts operation');
    return false;
  }

  // perform updates
  const mutateUserFlowchartsResult = mutateUserFlowcharts(
    userFlowchartsData,
    chunksList,
    courseCache,
    programCache
  );

  if (!mutateUserFlowchartsResult.success) {
    logger.warn(
      'mutateUserFlowcharts operation failed in persistUserDataChangesServer due to the following errors:',
      mutateUserFlowchartsResult.errors
    );
    return false;
  }

  logger.info(
    `Applied updates [${chunksList
      .map((chunk) => UserDataUpdateChunkType[chunk.type])
      .join(',')}] to flowcharts [${flowchartModifyIds.join(',')}]`
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
