import { z } from 'zod';
import { apiData } from '$lib/server/config/apiDataConfig';

export const searchCatalogSchema = z.object({
  catalog: z
    .string({
      required_error: 'Catalog field for catalog search is required.'
    })
    .superRefine((obj, ctx) => {
      // verify valid catalog
      if (!apiData.catalogs.includes(obj)) {
        ctx.addIssue({
          code: 'custom',
          message: `Catalog field for catalog search is invalid, received ${obj}.`,
          path: ['catalog']
        });
      }
    }),
  query: z.string({
    required_error: 'Query field for catalog search is required.'
  })
});
