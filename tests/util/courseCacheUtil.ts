import { ObjectMap } from '$lib/common/util/ObjectMap';
import { expect as pwExpect } from '@playwright/test';
import { cloneAndDeleteNestedProperty } from './testUtil';
import type { APICourseFull, CourseCache } from '$lib/types';

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
  // make sure all entries are present
  const expCatalogs = Array.from(expCourseCache.keys()).sort();
  const actCatalogs = Array.from(actCourseCache.keys()).sort();

  await assertToStrictEqual(expCatalogs, actCatalogs, testRunner);

  // now ensure that each course cache entry is correct
  for await (const entry of Array.from(expCourseCache.values())) {
    const expCourseObj = cloneAndDeleteNestedProperty(entry, 'dynamicTerms');
    const actCourseObj = cloneAndDeleteNestedProperty(
      actCourseCache.get({
        catalog: entry.catalog,
        id: entry.id
      }),
      'dynamicTerms'
    );

    await assertToStrictEqual(expCourseObj, actCourseObj, testRunner);
  }
}

export function createCourseCacheFromEntries(entries: APICourseFull[]): CourseCache {
  return new ObjectMap(
    (k) => `${k.catalog}|${k.id}`,
    entries.map((entry) => [
      {
        catalog: entry.catalog,
        id: entry.id
      },
      entry
    ])
  );
}
