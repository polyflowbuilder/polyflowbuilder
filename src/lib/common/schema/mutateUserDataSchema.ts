import { z } from 'zod';
import { courseSchema } from '$lib/common/schema/flowchartSchema';
import { UserDataUpdateChunkTERM_MODCourseDataFrom, UserDataUpdateChunkType } from '$lib/types';
import { flowchartTermDataSchema } from '$lib/common/schema/flowchartSchema';
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

const flowDeleteUpdateChunkSchema = z.object({
  type: z.literal(UserDataUpdateChunkType.FLOW_DELETE, {
    required_error: 'Incorrect type field for FLOW_DELETE update chunk.'
  }),
  data: z.object(
    {
      id: z
        .string({
          required_error: 'ID field for FLOW_DELETE update chunk required.'
        })
        .uuid('ID field for FLOW_DELETE update chunk must be a UUID.')
    },
    {
      required_error: 'Data field for update chunk required.'
    }
  )
});

const termModUpdateCourseFromExistingSchema = z.object({
  from: z.literal(UserDataUpdateChunkTERM_MODCourseDataFrom.EXISTING, {
    required_error: 'Incorrect type for from field for existing TERM_MOD from fragment.'
  }),
  data: z.object({
    tIndex: flowchartTermDataSchema.shape.tIndex,
    cIndex: z
      .number({
        required_error: 'Course index is required.'
      })
      .int({
        message: 'Course index must be an integer.'
      })
      .nonnegative({
        message: 'Course index must not be negative.'
      })
  })
});

const termModUpdateCourseFromNewSchema = z.object({
  from: z.literal(UserDataUpdateChunkTERM_MODCourseDataFrom.NEW, {
    required_error: 'Incorrect type for from field for new TERM_MOD from fragment.'
  }),
  data: courseSchema
});

const termModUpdateChunkSchema = z.object({
  type: z.literal(UserDataUpdateChunkType.TERM_MOD, {
    required_error: 'Incorrect type field for TERM_MOD update chunk.'
  }),
  data: z.object(
    {
      id: z
        .string({
          required_error: 'ID field for TERM_MOD update chunk required.'
        })
        .uuid('ID field for TERM_MOD update chunk must be a UUID.'),
      tIndex: flowchartTermDataSchema.shape.tIndex,
      termData: z.array(
        z.discriminatedUnion(
          'from',
          [termModUpdateCourseFromExistingSchema, termModUpdateCourseFromNewSchema],
          {
            required_error: 'Term data field required for TERM_MOD update chunk.'
          }
        )
      )
    },
    {
      required_error: 'Data field for update chunk required.'
    }
  )
});

export const UserDataUpdateChunkSchema = z.discriminatedUnion('type', [
  flowListChangeUpdateChunkSchema,
  flowUpsertAllUpdateChunkSchema,
  flowDeleteUpdateChunkSchema,
  termModUpdateChunkSchema
]);

export type FlowListChangeOrderField = z.infer<typeof flowListChangeOrderFieldSchema>;
export type FlowListChangeOrderEntry = z.infer<typeof flowListChangeOrderEntrySchema>;

export type UserDataUpdateChunk = z.infer<typeof UserDataUpdateChunkSchema>;
