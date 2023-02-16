import { writable } from 'svelte/store';
import type { Flowchart } from '@prisma/client';

// user flowcharts
export const userFlowcharts = writable<Flowchart[]>([]);
