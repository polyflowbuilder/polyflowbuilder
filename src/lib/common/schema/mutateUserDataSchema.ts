import { z } from 'zod';
import { UserDataUpdateChunkType } from '$lib/types';
import { flowchartValidationSchema } from '$lib/common/schema/flowchartSchema';

const positionSchema = z
  .number({
    required_error: 'Position field is required.'
  })
  .nonnegative({
    message: 'Position field must not be negative.'
  });

const flowListChangeOrderEntrySchema = z.object(
  {
    id: z
      .string({
        required_error: 'ID for order entry is required.'
      })
      .uuid({
        message: 'ID for order entry must be a UUID.'
      }),
    pos: positionSchema
  },
  {
    required_error: 'Order entry is required.'
  }
);

const flowListChangeOrderFieldSchema = z
  .array(flowListChangeOrderEntrySchema, {
    required_error: 'Order field for update chunk required.'
  })
  .nonempty({
    message: 'Order array must not be empty.'
  });

// validation schemas for user data mutation types
const flowListChangeUpdateChunkSchema = z.object({
  type: z.literal(UserDataUpdateChunkType.FLOW_LIST_CHANGE, {
    required_error: 'Incorrect type field for FLOW_LIST_CHANGE update chunk.'
  }),
  data: z.object(
    {
      order: flowListChangeOrderFieldSchema
    },
    {
      required_error: 'Data field for update chunk required.'
    }
  )
});

const flowUpsertAllUpdateChunkSchema = z.object({
  type: z.literal(UserDataUpdateChunkType.FLOW_UPSERT_ALL, {
    required_error: 'Incorrect type field for FLOW_UPSERT_ALL update chunk.'
  }),
  data: z.object(
    {
      flowchart: flowchartValidationSchema,
      pos: positionSchema
    },
    {
      required_error: 'Data field for update chunk required.'
    }
  )
});

export const UserDataUpdateChunkSchema = z.discriminatedUnion('type', [
  flowListChangeUpdateChunkSchema,
  flowUpsertAllUpdateChunkSchema
]);

export type FlowListChangeOrderField = z.infer<typeof flowListChangeOrderFieldSchema>;
export type FlowListChangeOrderEntry = z.infer<typeof flowListChangeOrderEntrySchema>;

export type UserDataUpdateChunk = z.infer<typeof UserDataUpdateChunkSchema>;
