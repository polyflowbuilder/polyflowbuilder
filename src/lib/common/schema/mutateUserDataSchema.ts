import { z } from 'zod';
import { UserDataUpdateChunkType } from '$lib/types';

// validation schemas for user data mutation types
const FlowListChangeUpdateChunkSchema = z.object({
  type: z.literal(UserDataUpdateChunkType.FLOW_LIST_CHANGE, {
    required_error: 'Incorrect type field for FLOW_LIST_CHANGE update chunk.'
  }),
  data: z.object(
    {
      order: z
        .array(
          z.object({
            id: z
              .string({
                required_error: 'ID for order entry is required.'
              })
              .uuid({
                message: 'ID for order entry must be a UUID.'
              }),
            pos: z
              .number({
                required_error: 'Position for order entry is required.'
              })
              .nonnegative({
                message: 'Position for order entry must not be negative.'
              })
          }),
          {
            required_error: 'Order field for update chunk required.'
          }
        )
        .nonempty({
          message: 'Order array must not be empty.'
        })
    },
    {
      required_error: 'Data field for update chunk required.'
    }
  )
});

export const UserDataUpdateChunkSchema = z.discriminatedUnion('type', [
  FlowListChangeUpdateChunkSchema
]);

export type UserDataUpdateChunk = z.infer<typeof UserDataUpdateChunkSchema>;