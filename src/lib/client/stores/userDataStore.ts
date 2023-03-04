import { writable } from 'svelte/store';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';

// user flowcharts
export const userFlowcharts = writable<Flowchart[]>([]);
