// common implementation for updating user data via update chunks (only includes update types common to frontend and backend)

import type { UserDataUpdateChunk } from '$lib/common/schema/mutateUserDataSchema';
import type { MutateFlowchartData } from '$lib/types';

export function mutateUserFlowcharts(
  curUserFlowcharts: MutateFlowchartData[],
  updateChunks: UserDataUpdateChunk[]
): MutateFlowchartData[] {
  const newUserFlowcharts = structuredClone(curUserFlowcharts);

  updateChunks.forEach((chunk) => {
    // TODO: add cases for different types of update payloads
    switch (chunk.type) {
    }
  });

  return newUserFlowcharts;
}
