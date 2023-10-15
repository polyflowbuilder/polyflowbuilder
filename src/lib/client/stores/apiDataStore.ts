import { writable } from 'svelte/store';
import { ObjectMap } from '$lib/common/util/ObjectMap';
import { writeOnceStore } from './util';
import type { Program } from '@prisma/client';
import type { CourseCache, MajorNameCache } from '$lib/types';

// API data for flowcharts
export const availableFlowchartStartYears = writeOnceStore<string[]>([]);
export const availableFlowchartCatalogs = writeOnceStore<string[]>([]);

// API data caches
export const programCache = writable<Program[]>([]);
export const courseCache = writable<CourseCache>(new ObjectMap());
export const majorNameCache = writable<MajorNameCache[]>([]);
export const catalogMajorNameCache = writable<Set<string>>(new Set<string>());
