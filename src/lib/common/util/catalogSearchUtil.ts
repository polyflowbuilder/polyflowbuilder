// common here bc shared on both client & server side

import Fuse from 'fuse.js';
import {
  FUZZY_SEARCH_THRESOLD,
  MAX_SEARCH_RESULTS_RETURN_COUNT,
  SANITIZE_REGEX
} from '$lib/common/config/catalogSearchConfig';
import type { APICourseFull } from '$lib/types';
import type { CatalogSearchResults } from '$lib/types/courseSearchTypes';

export function performCatalogSearch(
  query: string,
  catalogCourses: APICourseFull[]
): CatalogSearchResults {
  // sanitize input to prevent DoS by regex hijacking
  const querySanitized = SANITIZE_REGEX(query);
  let searchResults: APICourseFull[] = [];
  let searchLimitExceeded = false;

  if (querySanitized && catalogCourses.length) {
    // fuzzy searching
    const fuseSearch = new Fuse(catalogCourses, {
      keys: ['id', 'displayName', 'desc'],
      threshold: FUZZY_SEARCH_THRESOLD,
      includeScore: true
    });

    searchResults = fuseSearch
      .search(querySanitized)
      // TODO: not sure when the score won't be present, but if it's not
      // don't include any of those results
      .filter((fuseResult) => (fuseResult.score ?? 1) <= FUZZY_SEARCH_THRESOLD)
      .map((fuseResult) => catalogCourses[fuseResult.refIndex]);

    searchLimitExceeded = searchResults.length > MAX_SEARCH_RESULTS_RETURN_COUNT;
  }

  return {
    searchResults: searchResults.slice(0, MAX_SEARCH_RESULTS_RETURN_COUNT),
    searchLimitExceeded
  };
}
