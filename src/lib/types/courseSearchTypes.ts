import type { ObjectMap } from '$lib/common/util/ObjectMap';
import type { APICourseFull } from '$lib/types';

export interface CatalogSearchResults {
  searchResults: APICourseFull[];
  searchLimitExceeded: boolean;
  searchValid: boolean;
}

interface SearchCacheKey {
  catalog: string;
  field: string;
  query: string;
}

interface SearchCacheEntry {
  searchValid: boolean;
  searchLimitExceeded: boolean;
  searchResults: string[];
}

export type SearchCache = ObjectMap<SearchCacheKey, SearchCacheEntry>;
