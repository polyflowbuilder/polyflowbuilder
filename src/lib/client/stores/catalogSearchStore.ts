import { writable } from 'svelte/store';
import { ObjectMap } from '$lib/common/util/ObjectMap';
import type { CatalogSearchResults, SearchCache } from '$lib/types';

export const searchCache = writable<SearchCache>(new ObjectMap());
export const activeSearchResults = writable<Promise<CatalogSearchResults> | undefined>();
