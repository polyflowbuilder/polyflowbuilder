import { writable } from 'svelte/store';
import { writeOnceStore } from './util';
import type { Program } from '@prisma/client';
import type { CourseCache } from '$lib/types';

// API data for flowcharts
export const startYearsData = writeOnceStore<string[]>([]);
export const catalogYearsData = writeOnceStore<string[]>([]);
export const programData = writeOnceStore<Program[]>([]);

// API data for courses (client course cache)
export const courseCache = writable<CourseCache[]>([]);
