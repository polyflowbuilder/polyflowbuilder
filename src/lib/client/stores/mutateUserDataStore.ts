import { browser } from '$app/environment';
import { performUpdate } from '$lib/client/util/mutateUserDataUtilClient';
import { derived, writable } from 'svelte/store';
import { courseCache, programData } from './apiDataStore';
import { UPDATE_CHUNK_DELAY_TIME_MS } from '$lib/client/config/editorConfig';
import type { UserDataUpdateChunk } from '$lib/common/schema/mutateUserDataSchema';

// mutation store data
let delayingBeforeUpdate = false;
let updateTimer: ReturnType<typeof setTimeout>;
export const chunkListUpdateStore = writable<UserDataUpdateChunk[]>([]);

// using this derived store as an internal intermediary to get reactive updates
// for when courseCache and programData are updated as well
const mutationDataStore = derived(
  [chunkListUpdateStore, courseCache, programData],
  ([chunkList, courseCache, programData]) => {
    return {
      chunkList,
      courseCache,
      programData
    };
  }
);

mutationDataStore.subscribe(({ chunkList, courseCache, programData }) => {
  if (browser && chunkList.length) {
    if (!delayingBeforeUpdate) {
      delayingBeforeUpdate = true;
    } else {
      clearTimeout(updateTimer);
    }
    updateTimer = setTimeout(() => {
      delayingBeforeUpdate = false;
      performUpdate(chunkList, courseCache, programData);
    }, UPDATE_CHUNK_DELAY_TIME_MS);
  }
});
