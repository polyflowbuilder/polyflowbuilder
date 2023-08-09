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
  set: (val: Program[]) => {
    mockProgramDataWritable.set(val);
  }
};

export const mockCourseDataStore = {
  subscribe: mockCourseDataWritable.subscribe,
  set: (val: CourseCache[]) => {
    mockCourseDataWritable.set(val);
  }
};

// general-purpose mock modal store since we will only be
// using this mock for one store at a time
export const mockModalOpenStore = {
  subscribe: mockModalOpenWritable.subscribe,
  set: (val: boolean) => {
    mockModalOpenWritable.set(val);
  }
};

export const mockSelectedFlowIndexStore = {
  subscribe: mockSelectedFlowIndexWritable.subscribe,
  set: (val: number) => {
    mockSelectedFlowIndexWritable.set(val);
  }
};

export const mockUserFlowchartsStore = {
  subscribe: mockUserFlowchartsWritable.subscribe,
  set: (val: Flowchart[]) => {
    mockUserFlowchartsWritable.set(val);
  }
};
