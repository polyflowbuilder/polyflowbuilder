import { z } from 'zod';
import type { APICourse } from '@prisma/client';

// schema tightly couples w/ allCourseData bc don't know how to pass this data
// into the schema validator otherwise
import { allCourseData } from '../validation/validate-course-requisites';

// helper functions from old pfb2.0
function setCharAt(str: string, index: number, chr: string) {
  if (index > str.length - 1) throw new RangeError();
  return str.substring(0, index) + chr + str.substring(index + 1);
}
function generateReqOrBlocks(reqString: string) {
  let workingReqString = reqString;

  // replace all spaces inside single-quoted pieces w/ %
  let addPercent = false;
  for (let i = 0; i < workingReqString.length; i += 1) {
    if (workingReqString[i] === "'") {
      addPercent = !addPercent;
    }
    if (workingReqString[i] === ' ' && addPercent) {
      workingReqString = setCharAt(workingReqString, i, '%');
    }
  }

  // split into 'OR' blocks and remove temp %
  return workingReqString.split(' ').map((blk) => blk.replace(/%/g, ' '));
}

function validateRequisiteString(input: string, catalog: string, courseData: APICourse[]) {
  if (input.startsWith('$SKIP$') || input === '') {
    return true;
  }

  // get or blocks
  const orBlocks = generateReqOrBlocks(input);

  for (const orBlock of orBlocks) {
    const andBlocks = orBlock.includes('@') ? orBlock.split('@') : [orBlock];

    // check for any invalid and blocks
    for (const andBlock of andBlocks) {
      if (!andBlock.includes("'")) {
        // must be a valid class, verify
        const res = courseData.find((crs) => crs.catalog === catalog && crs.id === andBlock);
        if (!res) {
          console.log(
            'unable to find course',
            andBlock,
            'in specified catalog',
            catalog,
            'will search others'
          );
          const foundInOtherCatalog = courseData.find((crs) => crs.id === andBlock);
          if (foundInOtherCatalog) {
            console.log(
              'course',
              andBlock,
              'found in differing catalog',
              foundInOtherCatalog.catalog
            );
          } else {
            console.log('course', andBlock, 'found in none of the loaded catalogs');
          }
          return false;
        }
      }
    }
  }

  // if we get here, no invalid entries found and reqstr is valid
  return true;
}

// validation schema for req objects
export const requisiteValidationSchema = z
  .object({
    catalog: z.string(),
    id: z.string(),
    prerequisite: z.array(z.string()).nonempty(),
    corequisite: z.array(z.string()).nonempty(),
    recommended: z.array(z.string()).nonempty(),
    concurrent: z.array(z.string()).nonempty()
  })
  .superRefine((obj, ctx) => {
    // need to do additional validations here bc we need access to all variables

    // verify valid course
    if (!allCourseData.find((val) => val.catalog === obj.catalog && val.id === obj.id)) {
      ctx.addIssue({
        code: 'custom',
        message: 'APICourse catalog and ID pair are invalid.',
        path: ['catalog']
      });
      ctx.addIssue({
        code: 'custom',
        message: 'APICourse catalog and ID pair are invalid.',
        path: ['id']
      });
    }
    // verify prereq
    for (const reqStr of obj.prerequisite) {
      if (!validateRequisiteString(reqStr, obj.catalog, allCourseData)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Invalid requisite string.',
          path: ['prerequisite']
        });
      }
    }
    // verify coreq
    for (const reqStr of obj.corequisite) {
      if (!validateRequisiteString(reqStr, obj.catalog, allCourseData)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Invalid requisite string.',
          path: ['corequisite']
        });
      }
    }
    // verify recomm
    for (const reqStr of obj.recommended) {
      if (!validateRequisiteString(reqStr, obj.catalog, allCourseData)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Invalid requisite string.',
          path: ['recommended']
        });
      }
    }
    // verify concur
    for (const reqStr of obj.concurrent) {
      if (!validateRequisiteString(reqStr, obj.catalog, allCourseData)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Invalid requisite string.',
          path: ['concurrent']
        });
      }
    }
  });
