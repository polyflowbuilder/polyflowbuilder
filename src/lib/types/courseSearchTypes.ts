import type { APICourseFull } from '$lib/types';

export interface CatalogSearchResults {
  searchResults: APICourseFull[];
  searchLimitExceeded: boolean;
  searchValid: boolean;
}

// TODO: is this tree structure of the interface necessary?
export interface SearchCache {
  catalog: string;
  searches: {
    query: string;
    searchValid: boolean;
    searchLimitExceeded: boolean;
    searchResults: string[];
  }[];
}
