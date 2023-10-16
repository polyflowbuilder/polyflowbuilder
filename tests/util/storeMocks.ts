// for mocking stores
// needs to be in another file, see issue:
// https://github.com/sveltejs/kit/discussions/9759

import { apiData } from '$lib/server/config/apiDataConfig';
import { writable } from 'svelte/store';
import { ObjectMap } from '$lib/common/util/ObjectMap';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { MajorNameCache, CourseCache, ProgramCache } from '$lib/types';

// set stores
const mockAvailableFlowchartStartYearsWritable = writable<string[]>([]);
const mockAvailableFlowchartCatalogsWritable = writable<string[]>([]);
const mockProgramCacheWritable = writable<ProgramCache>(new Map());
const mockCourseCacheWritable = writable<CourseCache>(new ObjectMap());
const mockMajorNameCacheWritable = writable<MajorNameCache>(new Map());
const mockCatalogMajorNameCacheWritable = writable<Set<string>>(new Set<string>());
const mockModalOpenWritable = writable<boolean>(false);
const mockSelectedFlowIndexWritable = writable<number>(-1);
const mockUserFlowchartsWritable = writable<Flowchart[]>([]);

// apiDataStore mocks

// API data
export const mockAvailableFlowchartStartYearsStore = mockAvailableFlowchartStartYearsWritable;
export const mockAvailableFlowchartCatalogsStore = mockAvailableFlowchartCatalogsWritable;

// caches
export const mockProgramCacheStore = mockProgramCacheWritable;
export const mockCourseCacheStore = mockCourseCacheWritable;
export const mockMajorNameCacheStore = mockMajorNameCacheWritable;
export const mockCatalogMajorNameCacheStore = mockCatalogMajorNameCacheWritable;

// general-purpose mock modal store since we will only be
// using this mock for one store at a time
export const mockModalOpenStore = mockModalOpenWritable;

export const mockSelectedFlowIndexStore = mockSelectedFlowIndexWritable;

export const mockUserFlowchartsStore = mockUserFlowchartsWritable;

// configuring mocks
export function initMockedAPIDataStores() {
  // init all apiData in caches so we don't make any network requests
  // (this will be tested in integration/e2e tests)

  const apiDataProgramDataArr = Array.from(apiData.programData.values());

  const mockCatalogMajorNameCacheValue = new Set(
    apiDataProgramDataArr.map((entry) => `${entry.catalog}|${entry.majorName}`)
  );
  const mockMajorNameCacheValue = new Map(
    apiData.catalogs.map((catalog) => {
      const majorNames = [
        ...new Set(
          apiDataProgramDataArr
            .filter((entry) => entry.catalog === catalog)
            .map((entry) => entry.majorName)
            .sort()
        )
      ];
      return [catalog, majorNames];
    })
  );

  mockAvailableFlowchartStartYearsStore.set(apiData.startYears);
  mockAvailableFlowchartCatalogsStore.set(apiData.catalogs);
  mockProgramCacheStore.set(apiData.programData);
  mockMajorNameCacheStore.set(mockMajorNameCacheValue);
  mockCatalogMajorNameCacheStore.set(mockCatalogMajorNameCacheValue);
}
