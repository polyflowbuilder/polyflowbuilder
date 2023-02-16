import { writeOnceStore } from './util';
import type { Program } from '@prisma/client';

// API data for flowcharts
export const startYearsData = writeOnceStore<string[]>();
export const catalogYearsData = writeOnceStore<string[]>();
export const flowchartProgramData = writeOnceStore<Program[]>();
