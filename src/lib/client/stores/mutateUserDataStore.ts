import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { performUpdate } from '$lib/client/util/mutateUserDataUtilClient';
import { UPDATE_CHUNK_DELAY_TIME_MS } from '$lib/client/config/editorConfig';
import type { UserDataUpdateChunk } from '$lib/common/schema/mutateUserDataSchema';

// mutation store data
let delayingBeforeUpdate = false;
let updateTimer: ReturnType<typeof setTimeout>;
export const chunkListUpdateStore = writable<UserDataUpdateChunk[]>([]);
chunkListUpdateStore.subscribe((chunksList) => {
  if (browser && chunksList.length) {
    if (!delayingBeforeUpdate) {
      delayingBeforeUpdate = true;
    } else {
      clearTimeout(updateTimer);
    }
    updateTimer = setTimeout(() => {
      delayingBeforeUpdate = false;
      performUpdate(chunksList);
    }, UPDATE_CHUNK_DELAY_TIME_MS);
  }
});
