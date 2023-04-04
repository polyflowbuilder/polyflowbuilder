// common implementation for updating user data via update chunks (only includes update types common to frontend and backend)

import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { UserDataUpdateChunk } from '$lib/types';

export function mutateUserFlowcharts(
  curUserFlowcharts: Flowchart[],
  updateChunks: UserDataUpdateChunk[]
): Flowchart[] {
  const newUserFlowcharts = structuredClone(curUserFlowcharts);

  updateChunks.forEach((chunk) => {
    // TODO: add cases for different types of update payloads
    switch (chunk.type) {
    }
  });

  return newUserFlowcharts;
}
