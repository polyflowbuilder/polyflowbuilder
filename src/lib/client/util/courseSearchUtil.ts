import { courseCache } from '$lib/client/stores/apiDataStore';
import { SEARCH_DELAY_TIME_MS } from '$lib/common/config/catalogSearchConfig';
import { performCatalogSearch } from '$lib/common/util/catalogSearchUtil';
import { activeSearchResults, searchCache } from '$lib/client/stores/catalogSearchStore';
import type { SearchCatalogInput } from '$lib/server/schema/searchCatalogSchema';
import type { CatalogSearchResults, CourseCache, SearchCache } from '$lib/types';

let delayingBeforeSearch = false;
let beforeSearchTimer: ReturnType<typeof setTimeout>;
let fullSearchCache: SearchCache[] = [];
let fullCourseCache: CourseCache[] = [];
searchCache.subscribe((cache) => (fullSearchCache = cache));
courseCache.subscribe((cache) => (fullCourseCache = cache));

export function initSearch(query: string, catalog: string) {
  if (!delayingBeforeSearch) {
    delayingBeforeSearch = true;
  } else {
    clearTimeout(beforeSearchTimer);
  }
  beforeSearchTimer = setTimeout(() => {
    delayingBeforeSearch = false;
    const searchResults = performSearch(query, catalog);
    activeSearchResults.set(searchResults);
  }, SEARCH_DELAY_TIME_MS);
}

async function performSearch(query: string, catalog: string): Promise<CatalogSearchResults> {
  if (!query) {
    return {
      searchResults: [],
      searchLimitExceeded: false
    };
  }

  // get appropriate caches
  const searchCacheIdx = fullSearchCache.findIndex((cache) => cache.catalog === catalog);
  const courseCacheIdx = fullCourseCache.findIndex((cache) => cache.catalog === catalog);

  if (searchCacheIdx === -1 || courseCacheIdx === -1) {
    throw new Error(`unable to find cache entries required for search for catalog ${catalog}`);
  }

  // do local search if we already searched this term
  if (fullSearchCache[searchCacheIdx].queries.includes(query)) {
    return performCatalogSearch(query, fullCourseCache[courseCacheIdx].courses);
  }

  // if not, send request for search
  const searchPayload: SearchCatalogInput = {
    query,
    catalog
  };

  const searchResults = (await fetch('/api/data/searchCatalog', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(searchPayload)
  })
    .then((resp) => {
      if (!resp.ok) {
        alert(
          'Catalog search request failed. Please try again or file a bug report if this persists.'
        );
        console.error('Catalog search request failed with response code', resp.status);
        return null;
      }
      return resp.json();
    })
    .catch((err) => {
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
      searchLimitExceeded: false
    };
  }

  // if the request is successful, update caches and return
  searchCache.update((caches) => {
    caches[searchCacheIdx].queries.push(query);
    return caches;
  });
  courseCache.update((caches) => {
    // TODO: convert course cache to a set so this is super fast
    searchResults.results.searchResults.forEach((newCourse) => {
      if (
        !caches[courseCacheIdx].courses.find((cachedCourse) => cachedCourse.id === newCourse.id)
      ) {
        caches[courseCacheIdx].courses.push(newCourse);
      }
    });

    return caches;
  });

  return searchResults.results;
}
