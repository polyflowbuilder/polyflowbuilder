import { writable } from 'svelte/store';
import { ObjectMap } from '$lib/common/util/ObjectMap';
import type { CatalogSearchResults, SearchCache } from '$lib/types';

export const searchCache = writable<SearchCache>(
  new ObjectMap((k) => `${k.catalog}|${k.field}|${k.query}`)
);
export const activeSearchResults = writable<Promise<CatalogSearchResults> | undefined>();
