import { courseCache } from '$lib/client/stores/apiDataStore';
import { activeSearchResults, searchCache } from '$lib/client/stores/catalogSearchStore';
import {
  SEARCH_DELAY_TIME_MS,
  BOOLEAN_SEARCH_OPERATORS_REGEX
} from '$lib/client/config/catalogSearchConfigClient';
import type { CatalogSearchValidFields } from '$lib/server/schema/searchCatalogSchema';
import type { CatalogSearchResults, CourseCache, SearchCache } from '$lib/types';

let delayingBeforeSearch = false;
let beforeSearchTimer: ReturnType<typeof setTimeout>;
let fullSearchCache: SearchCache;
let fullCourseCache: CourseCache;
searchCache.subscribe((cache) => (fullSearchCache = cache));
courseCache.subscribe((cache) => (fullCourseCache = cache));

// if any boolean operators are present, return the query as-is
// else, add a wildcard at the end, as users expect the search tool
//  to function in this manner
export function transformRawQuery(query: string): string {
  return !query.length || BOOLEAN_SEARCH_OPERATORS_REGEX.test(query) ? query : `${query}*`;
}

export function initSearch(query: string, catalog: string, field: CatalogSearchValidFields) {
  if (!delayingBeforeSearch) {
    delayingBeforeSearch = true;
  } else {
    clearTimeout(beforeSearchTimer);
  }
  beforeSearchTimer = setTimeout(() => {
    delayingBeforeSearch = false;
    const searchResults = performSearch(query, catalog, field);
    activeSearchResults.set(searchResults);
  }, SEARCH_DELAY_TIME_MS);
}

async function performSearch(
  query: string,
  catalog: string,
  field: CatalogSearchValidFields
): Promise<CatalogSearchResults> {
  if (!query) {
    return {
      searchResults: [],
      searchLimitExceeded: false,
      searchValid: true
    };
  }

  // do local search if we already searched this term
  const searchRecord = fullSearchCache.get({
    catalog,
    field,
    query
  });

  if (searchRecord) {
    // do it this way to return results in the order they were originally received in
    return {
      searchResults: searchRecord.searchResults.map((id) => {
        const course = fullCourseCache.get({
          catalog,
          id
        });
        if (!course) {
          throw new Error(`course ${id} present in searchCache and not present in courseCache`);
        }
        return course;
      }),
      searchLimitExceeded: searchRecord.searchLimitExceeded,
      searchValid: searchRecord.searchValid
    };
  }

  // if not, send request for search
  const searchParams = new URLSearchParams({
    catalog,
    query,
    field
  });
  const searchResults = (await fetch(`/api/data/queryCourseCatalog?${searchParams.toString()}`)
    .then((resp) => {
      if (resp.status === 400) {
        return {
          message: 'invalid',
          results: {
            searchResults: [],
            searchLimitExceeded: false,
            searchValid: false
          }
        };
      }
      if (!resp.ok) {
        alert(
          'Catalog search request failed. Please try again or file a bug report if this persists.'
        );
        console.error('Catalog search request failed with response code', resp.status);
        return null;
      }
      return resp.json();
    })
    .catch((err: unknown) => {
      alert(
        'Catalog search request failed. Please try again or file a bug report if this persists.'
      );
      console.error('Catalog search request failed with error:', err);
      return null;
    })) as {
    message: string;
    results: CatalogSearchResults;
  } | null;

  if (!searchResults) {
    return {
      searchResults: [],
      searchLimitExceeded: false,
      searchValid: true
    };
  }

  // if the request is successful, update caches and return
  searchCache.update((cache) => {
    cache.set(
      {
        catalog,
        field,
        query
      },
      {
        searchValid: searchResults.results.searchValid,
        searchLimitExceeded: searchResults.results.searchLimitExceeded,
        searchResults: searchResults.results.searchResults.map((crs) => crs.id)
      }
    );
    return cache;
  });
  courseCache.update((cache) => {
    searchResults.results.searchResults.forEach((newCourse) => {
      fullCourseCache.set(
        {
          catalog,
          id: newCourse.id
        },
        newCourse
      );
    });

    return cache;
  });

  return searchResults.results;
}
