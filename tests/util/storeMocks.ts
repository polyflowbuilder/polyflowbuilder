// for mocking stores
// needs to be in another file, see issue:
// https://github.com/sveltejs/kit/discussions/9759

import { writable } from 'svelte/store';
import type { Program } from '@prisma/client';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { MajorNameCache, CourseCache } from '$lib/types';

// set stores
const mockAvailableFlowchartStartYearsWritable = writable<string[]>([]);
const mockAvailableFlowchartCatalogsWritable = writable<string[]>([]);
const mockProgramCacheWritable = writable<Program[]>([]);
const mockCourseCacheWritable = writable<CourseCache[]>([]);
const mockMajorNameCacheWritable = writable<MajorNameCache[]>([]);
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
