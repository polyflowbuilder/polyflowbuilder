// for mocking stores
// needs to be in another file, see issue:
// https://github.com/sveltejs/kit/discussions/9759

import { writable } from 'svelte/store';
import type { CourseCache } from '$lib/types';
import type { Program } from '@prisma/client';

// set stores
const mockProgramDataWritable = writable<Program[]>([]);
const mockCourseDataWritable = writable<CourseCache[]>([]);
const mockModalOpenWritable = writable<boolean>(false);

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
