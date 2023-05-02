import { COLORS } from '$lib/common/config/colorConfig';
import { incrementRangedUnits } from '$lib/common/util/unitCounterUtilCommon';
import { getCourseCatalogFromCourse } from '$lib/common/util/courseDataUtilCommon';
import type { Program } from '@prisma/client';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { CourseCache, FlowEditorFooterUnitCounts } from '$lib/types';

// TODO: combine with unitCounterUtilCommon?
// since we're traversing the entire unit tree in both cases

export function computeGroupUnits(
  flowchart: Flowchart | null,
  courseCache: CourseCache[],
  programCache: Program[]
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
      // perform lookup if necessary
      const courseCatalog = getCourseCatalogFromCourse(
        course.programIdIndex || 0,
        flowchart.programId,
        programCache
      );

      if (!courseCatalog) {
        throw new Error('could not find catalog for course in flowchart');
      }

      const courseMetadata = courseCache
        .find((cache) => cache.catalog === courseCatalog)
        ?.courses.find((c) => c.id === course.id);

      const units = course.customId ? course.customUnits : courseMetadata?.units;

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
