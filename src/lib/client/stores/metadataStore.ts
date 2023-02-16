import { writable } from 'svelte/store';

// various misc. metadata

// so that we don't refetch program data on session changes
export const programDataLoaded = writable(false);
