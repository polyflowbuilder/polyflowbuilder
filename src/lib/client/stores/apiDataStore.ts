import { writable } from 'svelte/store';
import { writeOnceStore } from './util';
import type { Program } from '@prisma/client';
import type { MajorNameCache, CourseCache } from '$lib/types';

// API data for flowcharts
export const availableFlowchartStartYears = writeOnceStore<string[]>([]);
export const availableFlowchartCatalogs = writeOnceStore<string[]>([]);

// API data caches
export const programCache = writable<Program[]>([]);
export const courseCache = writable<CourseCache[]>([]);
export const majorNameCache = writable<MajorNameCache[]>([]);
export const catalogMajorNameCache = writable<Set<string>>(new Set<string>());
