// handles common functionality with course data

import type { Course } from '$lib/common/schema/flowchartSchema';
import type { Program } from '@prisma/client';
import type { APICourseFull, ComputedCourseItemDisplayData, CourseCache } from '$lib/types';

export function getCourseFromCourseCache(
  course: Course,
  flowProgramId: string[],
  courseCache: CourseCache,
  programCache: Program[]
) {
  const courseCatalog = getCatalogFromProgramIDIndex(
    course.programIdIndex ?? 0,
    flowProgramId,
    programCache
  );
  const courseMetadata =
    !course.id || !courseCatalog ? null : courseCache.get(courseCatalog)?.get(course.id) ?? null;

  return courseMetadata;
}

export function getCatalogFromProgramIDIndex(
  programIDIndex: number,
  programId: string[],
  programCache: Program[]
): string | undefined {
  const program = programCache.find((prog) => prog.id === programId[programIDIndex]);
  return program?.catalog;
}

export function computeCourseDisplayValues(
  course: Course,
  courseMetadata: APICourseFull | null,
  // compute values that visible without looking at tooltip (for pdf gen)
  computeTooltipDisplayData = true
): ComputedCourseItemDisplayData {
  if (!course.id && !course.customId) {
    throw new Error('course id not valid for course');
  }

  // TODO: error checking for if we're using default course data but it's not defined
  return {
    // should never see 'unknown', course.id will always be nonnull if course.customId is null
    idName: course.customId ?? course.id ?? 'unknown',
    displayName: course.customDisplayName ?? courseMetadata?.displayName ?? '',
    units: course.customUnits ?? courseMetadata?.units ?? '0',
    color: course.color,
    ...(computeTooltipDisplayData && {
      tooltip: {
        custom: !!course.customId,
        desc: course.customDesc ?? courseMetadata?.desc ?? '',
        addlDesc: course.customDesc ? '' : courseMetadata?.addl ?? '',
        termsOffered: courseMetadata?.dynamicTerms ?? null
      }
    })
  };
}
