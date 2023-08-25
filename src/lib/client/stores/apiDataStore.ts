import { writable } from 'svelte/store';
import { writeOnceStore } from './util';
import type { Program } from '@prisma/client';
import type { CourseCache } from '$lib/types';

// API data for flowcharts
export const availableFlowchartStartYears = writeOnceStore<string[]>([]);
export const availableFlowchartCatalogs = writeOnceStore<string[]>([]);
export const programCache = writeOnceStore<Program[]>([]);

// API data for courses (client course cache)
export const courseCache = writable<CourseCache[]>([]);
