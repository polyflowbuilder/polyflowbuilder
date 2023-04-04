import { z } from 'zod';
import { UserDataUpdateChunkSchema } from '$lib/common/schema/mutateUserDataSchema';

// validation schema for updateUserFlowcharts payload
export const updateUserFlowchartsSchema = z.object({
  updateChunks: z
    .array(UserDataUpdateChunkSchema, {
      required_error: 'Flowchart update chunks array required.',
      invalid_type_error: 'Received incorrect type for flowchart update chunks array.'
    })
    .nonempty({
      message: 'Flowchart update chunks array must contain at least one update chunk.'
    })
});
