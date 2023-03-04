import { z } from 'zod';
import { apiData } from '$lib/server/config/apiDataConfig';
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
  startYear: z
    .string({
      required_error: 'Start year is required.'
    })
    .refine((startYear) => apiData.startYears.includes(startYear), 'Invalid start year.'),
  // encoded as comma-separated values in single string due to search param string requirements
  programIds: z
    .array(
      z.string().refine(
        (progId) => apiData.programData.find((prog) => prog.id === progId),
        (progId) => {
          return {
            message: `Program ID ${progId} is invalid.`
          };
        }
      )
    )
    .nonempty(),
  removeGECourses: z.boolean().default(false),
  generateCourseCache: z.boolean().default(true)
});

export type GenerateFlowchartData = z.infer<typeof generateFlowchartSchema>;
