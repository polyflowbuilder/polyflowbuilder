import { writable } from 'svelte/store';
import { ObjectMap } from '$lib/common/util/ObjectMap';
import { writeOnceStore } from '$lib/client/stores/util';
import type { CourseCache, MajorNameCache, ProgramCache } from '$lib/types';

// API data for flowcharts
export const availableFlowchartStartYears = writeOnceStore<string[]>([]);
export const availableFlowchartCatalogs = writeOnceStore<string[]>([]);

// API data caches
export const programCache = writable<ProgramCache>(new Map());
export const courseCache = writable<CourseCache>(new ObjectMap());
export const majorNameCache = writable<MajorNameCache[]>([]);
export const catalogMajorNameCache = writable<Set<string>>(new Set<string>());
