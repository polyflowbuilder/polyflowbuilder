import { COLORS } from '$lib/common/config/colorConfig';
import { SANITIZE_REGEX } from '$lib/common/config/catalogSearchConfig';
import { incrementRangedUnits } from '$lib/common/util/unitCounterUtilCommon';
import { getCourseFromCourseCache } from '$lib/common/util/courseDataUtilCommon';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { CourseCache, FlowEditorFooterUnitCounts, ProgramCache } from '$lib/types';

// TODO: combine with unitCounterUtilCommon?
// since we're traversing the entire unit tree in both cases

export function computeGroupUnits(
  flowchart: Flowchart | null,
  courseCache: CourseCache,
  programCache: ProgramCache
): FlowEditorFooterUnitCounts {
  const unitCounts: FlowEditorFooterUnitCounts = {
    major: '0',
    support: '0',
    conc1: '0',
    conc2: '0',
    ge: '0',
    elective: '0',
    other: '0',
    total: '0'
  };

  if (!flowchart) {
    return unitCounts;
  }

  // just use total from flowchart
  unitCounts.total = flowchart.unitTotal;

  // iterate over all courses
  flowchart.termData.forEach((term) => {
    term.courses.forEach((course) => {
      // perform lookup to get unit counts
      const courseMetadata = getCourseFromCourseCache(
        course,
        flowchart.programId,
        courseCache,
        programCache
      );
      if (course.id && !courseMetadata) {
        throw new Error(
          `unitCounterUtilClient: unable to locate course metadata for course ${course.id}`
        );
      }

      // customUnits takes precedence even if we have a standard course
      // (for standard+customUnit cases)
      const units = course.customUnits ?? courseMetadata?.units;

      if (units) {
        if (COLORS.major.includes(course.color)) {
          unitCounts.major = incrementRangedUnits(unitCounts.major, units);
        } else if (COLORS.support.includes(course.color)) {
          unitCounts.support = incrementRangedUnits(unitCounts.support, units);
        } else if (COLORS.conc1.includes(course.color)) {
          unitCounts.conc1 = incrementRangedUnits(unitCounts.conc1, units);
        } else if (COLORS.conc2.includes(course.color)) {
          unitCounts.conc2 = incrementRangedUnits(unitCounts.conc2, units);
        } else if (COLORS.ge.includes(course.color)) {
          unitCounts.ge = incrementRangedUnits(unitCounts.ge, units);
        } else if (COLORS.elective.includes(course.color)) {
          unitCounts.elective = incrementRangedUnits(unitCounts.elective, units);
        } else {
          unitCounts.other = incrementRangedUnits(unitCounts.other, units);
        }
      }
    });
  });

  return unitCounts;
}

// TODO: rename this file for just unit utilities
export function validateUnitString(unitsInput: string) {
  const unitsInputSanitized = SANITIZE_REGEX(unitsInput);
  const validationRegExp = new RegExp(/^\d{1,2}-\d{1,2}$|^\d{1,2}$/);

  // also check for unique numbers if there are ranged units
  // true when unique units (for single num OR double num case)
  let ascendingOrderUnits = true;
  if (unitsInputSanitized.includes('-')) {
    const [lowerUnits, upperUnits] = unitsInputSanitized.split('-').map((val) => Number(val));
    ascendingOrderUnits = lowerUnits < upperUnits;
  }

  return Boolean(unitsInputSanitized.match(validationRegExp)) && ascendingOrderUnits;
}
