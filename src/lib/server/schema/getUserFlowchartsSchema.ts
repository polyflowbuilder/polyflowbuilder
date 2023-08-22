import { z } from 'zod';

// validation schema for getUserFlowcharts payload
export const getUserFlowchartsSchema = z.object({
  includeCourseCache: z.boolean().default(false),
  includeProgramMetadata: z.boolean().default(false)
});
