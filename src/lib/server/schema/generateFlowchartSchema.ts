import { z } from 'zod';
import { startYearSchema } from '$lib/server/schema/common';
import { FLOW_NAME_MAX_LENGTH } from '$lib/common/config/flowDataConfig';

// validation schema for generate flowchart payload
export const generateFlowchartSchema = z.object({
  ownerId: z
    .string({ required_error: 'Owner unique ID is required.' })
    .uuid('Owner unique ID format is invalid.'),
  name: z
    .string({ required_error: 'Flowchart name is required.' })
    .min(1, {
      message: 'Flowchart name must not be blank.'
    })
    .max(FLOW_NAME_MAX_LENGTH, {
      message: `Flowchart name too long, max length is ${FLOW_NAME_MAX_LENGTH} characters.`
    }),
  startYear: startYearSchema,
  // encoded as comma-separated values in single string due to search param string requirements
  programIds: z
    .array(
      z.string().uuid({
        message: 'Invalid format for program unique ID.'
      }),
      {
        required_error: 'Program Id(s) required.'
      }
    )
    .nonempty('At least one program id must be present.')
    .refine(
      (arr) => new Set(arr).size === arr.length,
      'Cannot have duplicate program ids in flowchart.'
    ),
  removeGECourses: z.boolean().default(false),
  generateCourseCache: z.boolean().default(true)
});

export type GenerateFlowchartData = z.infer<typeof generateFlowchartSchema>;
