import { z } from 'zod';
import { catalogSchema } from '$lib/server/schema/queryAvailableProgramsSchema';

export const queryAvailableMajorsSchema = z.object(
  {
    query: z.object({
      catalog: catalogSchema
    })
  },
  {
    required_error: 'Query field is required.'
  }
);
