// schema for user-level flowchart types
import { z } from 'zod';
import {
  FLOW_NAME_MAX_LENGTH,
  FLOW_PROGRAMS_MAX_COUNT,
  FLOW_NOTES_MAX_LENGTH,
  CUSTOM_COURSE_CARD_TITLE_MAX_LENGTH,
  CUSTOM_COURSE_CARD_DISPLAY_NAME_MAX_LENGTH,
  CUSTOM_COURSE_CARD_DESC_MAX_LENGTH
} from '$lib/common/config/flowDataConfig';

// validation schema for user-level flowchart

// data version that this schema conforms to
export const dataModelVersion = 7;

const md5HashRegExp = /^[a-f0-9]{32}$/i;
const colorRegExp = /#[0-9A-F]{6}\b/;

// allow non-integers due to quarter <-> semester unit conversion
// 1 semester unit = 1.5 quarter units
export const unitSchema = z
  .string({
    required_error: 'Unit count is required.'
  })
  .min(1, 'Unit count must not be empty.')
  .refine(
    (unitTotal) => {
      if (unitTotal.includes('-')) {
        const parts = unitTotal.split('-').map((part) => Number(part));
        return !isNaN(parts[0]) && !isNaN(parts[1]) && parts[1] > parts[0];
      }
      return !isNaN(Number(unitTotal));
    },
    (unitTotal) => {
      return {
        message: `Unit total is invalid, have ${unitTotal}`
      };
    }
  );

export const courseSchema = z
  .object(
    {
      id: z.union([z.string().min(1, 'Course ID must not be empty.'), z.null()], {
        errorMap: (issue, ctx) => {
          if (
            issue.code === z.ZodIssueCode.invalid_union &&
            issue.unionErrors[0].issues[0].code === z.ZodIssueCode.invalid_type
          ) {
            if (issue.unionErrors[0].issues[0].received === z.ZodParsedType.undefined) {
              return { message: 'Course ID field is required.' };
            }
            return {
              message: 'Course ID must either be a nonempty string or null.'
            };
          }
          return { message: ctx.defaultError };
        }
      }),
      color: z
        .string({
          required_error: 'Course card color is required.'
        })
        .refine(
          (color) => colorRegExp.test(color),
          (color) => {
            return {
              message: `Course card color invalid, received ${color}.`
            };
          }
        ),
      customId: z
        .string()
        .refine(
          (customId) => customId.length <= CUSTOM_COURSE_CARD_TITLE_MAX_LENGTH,
          (customId) => {
            return {
              message: `Course custom ID too long, length ${customId.length}/${CUSTOM_COURSE_CARD_TITLE_MAX_LENGTH} characters.`
            };
          }
        )
        .optional(),
      customDisplayName: z
        .string()
        .refine(
          (customDisplayName) =>
            customDisplayName.length <= CUSTOM_COURSE_CARD_DISPLAY_NAME_MAX_LENGTH,
          (customDisplayName) => {
            return {
              message: `Course custom display name too long, length ${customDisplayName.length}/${CUSTOM_COURSE_CARD_DISPLAY_NAME_MAX_LENGTH} characters.`
            };
          }
        )
        .optional(),
      customUnits: unitSchema.optional(),
      customDesc: z
        .string()
        .refine(
          (customNote) => customNote.length <= CUSTOM_COURSE_CARD_DESC_MAX_LENGTH,
          (customNote) => {
            return {
              message: `Course custom description name too long, length ${customNote.length}/${CUSTOM_COURSE_CARD_DESC_MAX_LENGTH} characters.`
            };
          }
        )
        .optional(),
      // if missing, then course is associated with first program in flowchart
      programIdIndex: z.number().int().nonnegative().optional()
    },
    {
      required_error: 'Course information required.'
    }
  )
  .superRefine(({ id, customId, customDisplayName, customDesc }, ctx) => {
    if (id === null && !customId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Course customId was undefined when standard Id was null.',
        path: ['id']
      });
      ctx.addIssue({
        code: 'custom',
        message: 'Course customId was undefined when standard Id was null.',
        path: ['customId']
      });
    }

    if (customId === undefined && !!customDisplayName) {
      ctx.addIssue({
        code: 'custom',
        message: 'Course custom display name defined for non-custom course.',
        path: ['customDisplayName']
      });
    }

    if (customId === undefined && !!customDesc) {
      ctx.addIssue({
        code: 'custom',
        message: 'Course custom description defined for non-custom course.',
        path: ['customDisplayName']
      });
    }
  });

export const flowchartTermDataSchema = z.object(
  {
    tIndex: z
      .number({
        required_error: 'Term index is required.'
      })
      .int('Term index must be an integer.')
      .min(-1, 'Flowchart term index too small.'),
    tUnits: unitSchema,
    courses: z.array(courseSchema, {
      required_error: 'Array for courses in term is required.'
    })
  },
  {
    required_error: 'Flowchart term data is required.'
  }
);

// mirrors the DB schema as closely as possible
export const flowchartValidationSchema = z
  .object(
    {
      id: z
        .string({
          required_error: 'Flowchart unique ID is required.'
        })
        .uuid('Invalid format for flowchart unique ID.'),
      ownerId: z
        .string({
          required_error: 'Owner unique ID is required.'
        })
        .uuid('Invalid format for owner unique ID.'),
      name: z
        .string({
          required_error: 'Flowchart name is required.'
        })
        .min(1, 'Flowchart name cannot be blank.')
        .refine(
          (name) => name.length <= FLOW_NAME_MAX_LENGTH,
          (name) => {
            return {
              message: `Flowchart name too long, length ${name.length}/${FLOW_NAME_MAX_LENGTH} characters.`
            };
          }
        ),
      // TODO: runtime checks for valid program IDs?
      // already have constraints in DB
      programId: z
        .array(
          z
            .string()
            .uuid('Invalid format for flowchart program ID.')
            .min(1, 'Program ID cannot be empty.'),
          {
            required_error: 'Flowchart program ID is required.'
          }
        )
        // these two refinements are to have runtime length checks instead of static time
        .refine(
          (programId) => programId.length > 0,
          'At least one program ID is required per flowchart.'
        )
        .refine(
          (programId) => programId.length <= FLOW_PROGRAMS_MAX_COUNT,
          (programId) => {
            return {
              message: `Too many program IDs in this flowchart, have ${programId.length}/${FLOW_PROGRAMS_MAX_COUNT} program IDs.`
            };
          }
        ),
      // TODO: runtime checks for startYear?
      // already have constraints in DB
      startYear: z
        .string({
          required_error: 'Flowchart start year is required.'
        })
        .length(4, 'Flowchart start year needs 4 characters.')
        .refine((str) => parseInt(str), 'Flowchart start year must be a valid number.'),
      unitTotal: unitSchema,
      notes: z
        .string({
          required_error: 'Flowchart notes field is required.'
        })
        .refine(
          (notes) => notes.length <= FLOW_NOTES_MAX_LENGTH,
          (notes) => {
            return {
              message: `Flowchart notes too long, length ${notes.length}/${FLOW_NOTES_MAX_LENGTH} characters.`
            };
          }
        ),
      termData: z.array(flowchartTermDataSchema, {
        required_error: 'Array for terms in flowchart is required.'
      }),
      version: z
        .number({
          required_error: 'Flowchart version is required.'
        })
        .int('Flowchart version must be an integer.')
        .positive('Flowchart version must be a positive integer.'),
      hash: z
        .string({
          required_error: 'Hash is required.'
        })
        .refine(
          (hash) => {
            // MD5 [flowMetadataHash].[flowContentHash]
            const parts = hash.split('.');
            return md5HashRegExp.test(parts[0]) && md5HashRegExp.test(parts[1]);
          },
          (hash) => {
            return {
              message: `Hash is invalid, have ${hash}.`
            };
          }
        ),
      validationData: z
        .object(
          {},
          {
            required_error: 'TODO: ADD VALIDATION DATA SCHEMA'
          }
        )
        .optional(),
      publishedId: z.union(
        [z.string().uuid('Invalid unique ID for flowchart published ID.'), z.null()],
        {
          errorMap: (issue, ctx) => {
            if (
              issue.code === z.ZodIssueCode.invalid_union &&
              issue.unionErrors[0].issues[0].code === z.ZodIssueCode.invalid_type
            ) {
              if (issue.unionErrors[0].issues[0].received === z.ZodParsedType.undefined) {
                return { message: 'Flowchart published ID field is required.' };
              }
              return {
                message: 'Flowchart published ID field must either be a string UUID or null.'
              };
            }
            return { message: ctx.defaultError };
          }
        }
      ),
      importedId: z.union(
        [z.string().uuid('Invalid unique ID for flowchart imported ID.'), z.null()],
        {
          errorMap: (issue, ctx) => {
            if (
              issue.code === z.ZodIssueCode.invalid_union &&
              issue.unionErrors[0].issues[0].code === z.ZodIssueCode.invalid_type
            ) {
              if (issue.unionErrors[0].issues[0].received === z.ZodParsedType.undefined) {
                return { message: 'Flowchart imported ID field is required.' };
              }
              return {
                message: 'Flowchart imported ID field must either be a string UUID or null.'
              };
            }
            return { message: ctx.defaultError };
          }
        }
      ),
      lastUpdatedUTC: z.date({
        required_error: 'Flowchart last updated UTC time is required.'
      })
    },
    {
      required_error: 'Flowchart data is required.'
    }
  )
  .superRefine(({ termData, programId }, ctx) => {
    // make sure program Ids after the first one dont have 'null'
    // interspersed with valid IDs (eg should be all valid then all null)
    for (let i = 1; i < programId.length; i += 1) {
      if (programId[i] !== null && programId[i - 1] === null) {
        ctx.addIssue({
          code: 'custom',
          message: 'Found null programId before nonnull programId.',
          path: ['programId']
        });
      }
    }

    // verify creditBin term present
    if (!termData.find((term) => term.tIndex === -1)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Term data missing required credit bin tIndex.',
        path: ['termData']
      });
    }
  });

// schema types
export type Unit = z.infer<typeof unitSchema>;
export type Course = z.infer<typeof courseSchema>;
export type Term = z.infer<typeof flowchartTermDataSchema>;
export type Flowchart = z.infer<typeof flowchartValidationSchema>;
