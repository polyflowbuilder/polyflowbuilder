import { z } from 'zod';

export const startYearSchema = z
  .string({
    required_error: 'Start year is required.'
  })
  .refine((startYear) => {
    const num = Number(startYear);
    return !isNaN(num) && startYear.length === 4 && num >= 2000;
  }, 'Invalid start year format.');

export const catalogSchema = z
  .string({
    required_error: 'Catalog is required.'
  })
  .refine((catalog) => {
    const parts = catalog.split('-').map((part) => Number(part));
    return (
      catalog.length === 9 &&
      !isNaN(parts[0]) &&
      !isNaN(parts[1]) &&
      parts[0] >= 2000 &&
      parts[1] >= 2000 &&
      parts[1] > parts[0]
    );
  }, 'Invalid catalog format.');
