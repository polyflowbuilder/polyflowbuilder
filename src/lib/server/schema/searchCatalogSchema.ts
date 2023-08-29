import { z } from 'zod';
import { catalogSchema } from '$lib/server/schema/common';

export const searchCatalogSchema = z.object({
  catalog: catalogSchema,
  query: z.string({
    required_error: 'Query field for catalog search is required.'
  }),
  field: z.enum(['id', 'displayName']).default('displayName')
});

export type CatalogSearchValidFields = z.infer<typeof searchCatalogSchema>['field'];
