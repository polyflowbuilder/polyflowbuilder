import { expect as pwExpect } from '@playwright/test';
import { cloneAndDeleteNestedProperty } from './testUtil';
import type { CourseCache } from '$lib/types';

async function assertToStrictEqual(
  exp: unknown,
  act: unknown,
  testRunner: 'playwright' | 'vitest'
) {
  if (testRunner === 'playwright') {
    pwExpect(act).toStrictEqual(exp);
  } else {
    // need dynamic import or else will crash when trying to run playwright tests
    const vt = await import('vitest');
    vt.expect(act).toStrictEqual(exp);
  }
}

export async function verifyCourseCacheStrictEquality(
  expCourseCache: CourseCache,
  actCourseCache: CourseCache,
  testRunner: 'playwright' | 'vitest'
) {
  // make sure all catalogs are present
  const expCatalogs = Array.from(expCourseCache.keys()).sort();
  const actCatalogs = Array.from(actCourseCache.keys()).sort();

  await assertToStrictEqual(expCatalogs, actCatalogs, testRunner);

  // for each catalog, expect all courses to be the same
  for await (const [catalog, expCourseCacheEntries] of expCourseCache) {
    const actCourseCacheEntries = actCourseCache.get(catalog);
    if (!actCourseCacheEntries) {
      throw new Error(`actCourseCache entry for catalog ${catalog} missing`);
    }

    // make sure all courses are present
    const expCourses = Array.from(expCourseCacheEntries.keys()).sort();
    const actCourses = Array.from(actCourseCacheEntries.keys()).sort();

    await assertToStrictEqual(expCourses, actCourses, testRunner);

    // now ensure that each course cache entry is correct

    for await (const entry of Array.from(expCourseCacheEntries.values())) {
      const expCourseObj = cloneAndDeleteNestedProperty(entry, 'dynamicTerms');
      const actCourseObj = cloneAndDeleteNestedProperty(
        actCourseCacheEntries.get(entry.id),
        'dynamicTerms'
      );

      await assertToStrictEqual(expCourseObj, actCourseObj, testRunner);
    }
  }
}
