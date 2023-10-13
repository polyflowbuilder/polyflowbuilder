import { expect } from '@playwright/test';
import { cloneAndDeleteNestedProperty } from 'tests/util/testUtil';
import type { CourseCache } from '$lib/types';

export function verifyCourseCacheStrictEquality(
  expCourseCache: CourseCache,
  actCourseCache: CourseCache
) {
  // make sure all catalogs are present
  expect(Array.from(actCourseCache.keys()).sort()).toStrictEqual(
    Array.from(expCourseCache.keys()).sort()
  );

  // for each catalog, expect all courses to be the same
  expCourseCache.forEach((expCourseCacheEntries, catalog) => {
    const actCourseCacheEntries = actCourseCache.get(catalog);
    if (!actCourseCacheEntries) {
      throw new Error(`actCourseCache entry for catalog ${catalog} missing`);
    }

    // make sure all courses are present
    expect(Array.from(actCourseCacheEntries.keys()).sort()).toStrictEqual(
      Array.from(expCourseCacheEntries.keys()).sort()
    );

    // now ensure that each course cache entry is correct
    Array.from(expCourseCacheEntries.values()).forEach((entry) => {
      expect(
        cloneAndDeleteNestedProperty(actCourseCacheEntries.get(entry.id), 'dynamicTerms')
      ).toStrictEqual(cloneAndDeleteNestedProperty(entry, 'dynamicTerms'));
    });
  });
}
