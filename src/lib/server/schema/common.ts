import { z } from 'zod';

export const catalogSchema = z
  .string({
    required_error: 'Catalog is required.'
  })
  .refine((catalog) => {
    const parts = catalog.split('-').map((part) => Number(part));
    return catalog.length === 9 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[1] > parts[0];
  }, 'Invalid catalog format.');
