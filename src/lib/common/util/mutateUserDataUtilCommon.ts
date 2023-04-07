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
        }

        // then sort flows by pos since frontend requires this
        newUserFlowchartsData.sort((a, b) => a.pos - b.pos);

        break;
      }
      default: {
        errors.push(`Unrecognized update chunk type ${chunk.type}`);
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
