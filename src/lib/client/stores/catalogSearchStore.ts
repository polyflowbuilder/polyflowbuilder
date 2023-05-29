import { writable } from 'svelte/store';
import type { CatalogSearchResults, SearchCache } from '$lib/types';

export const searchCache = writable<SearchCache[]>([]);
export const activeSearchResults = writable<Promise<CatalogSearchResults>>();
