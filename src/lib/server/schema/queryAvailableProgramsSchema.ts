import { z } from 'zod';
import { catalogSchema } from '$lib/server/schema/common';

// validation schema for api/data/queryAvailablePrograms endpoint
// currently only support the following query types:
// 1. id
// 2. catalog+majorName
export const queryAvailableProgramsSchema = z.object({
  query: z.union(
    [
      z
        .object({
          id: z
            .string({
              required_error: 'Program unique ID is required.'
            })
            .uuid('Invalid format for program unique ID.')
        })
        .strict({
          message: 'Invalid query for available programs.'
        }),
      z
        .object({
          majorName: z
            .string({
              required_error: 'Major name is required.'
            })
            .min(1, 'Major name must not be empty.'),
          catalog: catalogSchema
        })
        .strict({
          message: 'Invalid query for available programs.'
        })
    ],
    {
      errorMap: (issue, ctx) => {
        if (issue.code === z.ZodIssueCode.invalid_union) {
          return {
            message: 'Invalid query for available programs.'
          };
        }
        return {
          message: ctx.defaultError
        };
      }
    }
  )
});
