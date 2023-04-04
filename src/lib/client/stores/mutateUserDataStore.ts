import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { UPDATE_CHUNK_DELAY_TIME_MS } from '$lib/client/config/editorConfig';
import type { UserDataUpdateChunk } from '$lib/types';

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
      //   performUpdate(chunksList);
    }, UPDATE_CHUNK_DELAY_TIME_MS);
  }
});
