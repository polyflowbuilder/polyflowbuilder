// for mocking stores
// needs to be in another file, see issue:
// https://github.com/sveltejs/kit/discussions/9759

import { writable } from 'svelte/store';
import type { Program } from '@prisma/client';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { CourseCache } from '$lib/types';

// set stores
const mockProgramDataWritable = writable<Program[]>([]);
const mockCourseDataWritable = writable<CourseCache[]>([]);
const mockModalOpenWritable = writable<boolean>(false);
const mockSelectedFlowIndexWritable = writable<number>(-1);
const mockUserFlowchartsWritable = writable<Flowchart[]>([]);

export const mockProgramDataStore = {
  subscribe: mockProgramDataWritable.subscribe,
  set: mockProgramDataWritable.set
};

export const mockCourseDataStore = {
  subscribe: mockCourseDataWritable.subscribe,
  set: mockCourseDataWritable.set
};

// general-purpose mock modal store since we will only be
// using this mock for one store at a time
export const mockModalOpenStore = {
  subscribe: mockModalOpenWritable.subscribe,
  set: mockModalOpenWritable.set
};

export const mockSelectedFlowIndexStore = {
  subscribe: mockSelectedFlowIndexWritable.subscribe,
  set: mockSelectedFlowIndexWritable.set
};

export const mockUserFlowchartsStore = {
  subscribe: mockUserFlowchartsWritable.subscribe,
  set: mockUserFlowchartsWritable.set
};
