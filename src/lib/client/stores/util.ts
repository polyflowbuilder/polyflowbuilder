import { writable } from 'svelte/store';

export function writeOnceStore<T>() {
  const { subscribe, update } = writable<T | null>(null);

  return {
    subscribe,
    init: (data: T) => update((oldData) => (oldData ? oldData : data))
  };
}
