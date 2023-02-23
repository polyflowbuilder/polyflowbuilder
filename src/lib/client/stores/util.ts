import { writable } from 'svelte/store';

export function writeOnceStore<T>(initVal: T) {
  const { subscribe, update } = writable<T>(initVal);

  return {
    subscribe,
    init: (data: T) => {
      if (data) {
        update((oldData) => (oldData === initVal ? data : oldData));
      }
    }
  };
}
