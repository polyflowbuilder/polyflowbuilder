import type { APICourseFull } from '$lib/types';

export interface CatalogSearchResults {
  searchResults: APICourseFull[];
  searchLimitExceeded: boolean;
}

export interface SearchCache {
  catalog: string;
  queries: string[];
}
