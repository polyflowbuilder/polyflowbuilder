// common implementation for updating user data via update chunks (only includes update types common to frontend and backend)

import { UserDataUpdateChunkType } from '$lib/types';
import type { UserDataUpdateChunk } from '$lib/common/schema/mutateUserDataSchema';
import type { MutateFlowchartData, MutateUserDataUtilCommonResult } from '$lib/types';

export function mutateUserFlowcharts(
  curUserFlowchartsData: MutateFlowchartData[],
  updateChunks: UserDataUpdateChunk[]
): MutateUserDataUtilCommonResult {
  const errors: string[] = [];

  const newUserFlowchartsData = structuredClone(curUserFlowchartsData);

  // each chunk needs to modify the lastUpdatedUTC time explicitly since not all
  // flows in curUserFlowchartsData are actually updated for a particular update chunk
  updateChunks.forEach((chunk) => {
    switch (chunk.type) {
      case UserDataUpdateChunkType.FLOW_LIST_CHANGE: {
        // update pos for each flowchart specified in order entries
        for (const flowPosEntry of chunk.data.order) {
          const flowDataArrIdx = newUserFlowchartsData.findIndex(
            (flowData) => flowData.flowchart.id === flowPosEntry.id
          );

          // should only occur in test env
          if (flowDataArrIdx === -1) {
            errors.push(
              `Unable to find flowchart ${
                flowPosEntry.id
              } referenced in flowPosEntry for FLOW_LIST_CHANGE update chunk from provided flowchart list [${newUserFlowchartsData.map(
                ({ flowchart }) => flowchart.id
              )}]`
            );
            break;
          }

          newUserFlowchartsData[flowDataArrIdx].pos = flowPosEntry.pos;
          newUserFlowchartsData[flowDataArrIdx].flowchart.lastUpdatedUTC = new Date();
        }

        // then sort flows by pos since frontend requires this
        newUserFlowchartsData.sort((a, b) => a.pos - b.pos);

        break;
      }
      case UserDataUpdateChunkType.FLOW_UPSERT_ALL: {
        const flowDataArrIdx = newUserFlowchartsData.findIndex(
          (flowData) => flowData.flowchart.id === chunk.data.flowchart.id
        );

        // replace if found, add if not (upsert)
        if (flowDataArrIdx === -1) {
          newUserFlowchartsData.push(chunk.data);
        } else {
          newUserFlowchartsData[flowDataArrIdx] = chunk.data;
        }

        break;
      }
      default: {
        // typecast since if we handle all known types above, chunk will resolve to type never
        errors.push(`Unrecognized update chunk type ${(chunk as UserDataUpdateChunk).type}`);
        break;
      }
    }
  });

  if (errors.length) {
    return {
      success: false,
      errors
    };
  } else {
    return {
      success: true,
      flowchartsData: newUserFlowchartsData
    };
  }
}
