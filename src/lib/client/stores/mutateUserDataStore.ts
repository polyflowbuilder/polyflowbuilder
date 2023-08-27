import { browser } from '$app/environment';
import { performUpdate } from '$lib/client/util/mutateUserDataUtilClient';
import { derived, writable } from 'svelte/store';
import { courseCache, programCache } from './apiDataStore';
import { UPDATE_CHUNK_DELAY_TIME_MS } from '$lib/client/config/editorConfig';
import type { UserDataUpdateChunk } from '$lib/common/schema/mutateUserDataSchema';

// mutation store data
let delayingBeforeUpdate = false;
let updateTimer: ReturnType<typeof setTimeout>;
export const chunkListUpdateStore = writable<UserDataUpdateChunk[]>([]);

// using this derived store as an internal intermediary to get reactive updates
// for when courseCache and programCache are updated as well
const mutationDataStore = derived(
  [chunkListUpdateStore, courseCache, programCache],
  ([chunkList, courseCache, programCache]) => {
    return {
      chunkList,
      courseCache,
      programCache
    };
  }
);

mutationDataStore.subscribe(({ chunkList, courseCache, programCache }) => {
  if (browser && chunkList.length) {
    if (!delayingBeforeUpdate) {
      delayingBeforeUpdate = true;
    } else {
      clearTimeout(updateTimer);
    }
    updateTimer = setTimeout(() => {
      delayingBeforeUpdate = false;
      performUpdate(chunkList, courseCache, programCache);
    }, UPDATE_CHUNK_DELAY_TIME_MS);
  }
});
