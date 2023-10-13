// util functions for syncing user datamodel w/ backend

import { userFlowcharts } from '$lib/client/stores/userDataStore';
import { chunkListUpdateStore } from '$lib/client/stores/mutateUserDataStore';
import { mutateUserFlowcharts } from '$lib/common/util/mutateUserDataUtilCommon';
import type { Program } from '@prisma/client';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { CourseCache } from '$lib/types';
import type { UserDataUpdateChunk } from '$lib/common/schema/mutateUserDataSchema';

// wrapper to add an UpdateChunk to the queue
export function submitUserDataUpdateChunk(userDataUpdateChunk: UserDataUpdateChunk): void {
  chunkListUpdateStore.update((curChunkListUpdateStoreList) => [
    ...curChunkListUpdateStoreList,
    userDataUpdateChunk
  ]);
}

// TODO: integrate other types of user data, currently just flowcharts
export function performUpdate(
  chunksList: UserDataUpdateChunk[],
  courseCache: CourseCache,
  programCache: Program[]
): void {
  userFlowcharts.update((curUserFlowcharts) => {
    // update client first
    const mutateUserFlowchartsResult = mutateUserFlowcharts(
      curUserFlowcharts.map((flowchart, pos) => {
        return {
          flowchart,
          pos
        };
      }),
      chunksList,
      courseCache,
      programCache
    );

    // only update server if successful
    if (mutateUserFlowchartsResult.success) {
      // don't await, optimistic UI updating for good UX
      // failure paths handled in function, so no need for error checking here also
      void sendUserDataChangePersistRequest(chunksList, curUserFlowcharts);

      return mutateUserFlowchartsResult.flowchartsData.map(({ flowchart }) => flowchart);
    } else {
      // TODO: add client-side debug flag to show errors that came from mutation
      alert(
        'ERROR: PolyFlowBuilder could not perform the requested changes. Please file a bug report!'
      );
      return curUserFlowcharts;
    }
  });

  chunkListUpdateStore.set([]);
}

async function sendUserDataChangePersistRequest(
  chunksList: UserDataUpdateChunk[],
  curUserFlowcharts: Flowchart[]
): Promise<void> {
  await fetch('/api/user/data/updateUserFlowcharts', {
    method: 'POST',
    body: JSON.stringify({
      updateChunks: chunksList
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((resp) => {
      if (resp.status === 401) {
        alert(
          'ERROR: You were not authorized to perform the most recent flow data change. Please refresh the page and re-authenticate.'
        );
        userFlowcharts.set(curUserFlowcharts); // restore to old value before the update
      } else if (!resp.ok) {
        alert(
          'ERROR: The server reported an error on data modification. This means that your most recent changes were not saved. Please reload the page to ensure that no data has been lost.'
        );
        console.error('Server reported error on data modification:', resp.statusText);
        userFlowcharts.set(curUserFlowcharts); // restore to old value before the update
      }
    })
    .catch((error) => {
      alert(
        'ERROR: The client (your browser) reported an unexpected error on data modification. This means that your most recent changes were not saved. Please reload the page to ensure that no data has been lost.'
      );
      console.error('Unexpected client error occurred on data modification:', error);
      userFlowcharts.set(curUserFlowcharts); // restore to old value before the update
    });
}
