import type { APICourseFull } from '$lib/types';

export type CatalogSearchResults = {
  searchResults: APICourseFull[];
  searchLimitExceeded: boolean;
};

export type SearchCache = {
  catalog: string;
  queries: string[];
};
