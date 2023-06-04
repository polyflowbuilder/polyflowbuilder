import { flowchartValidationSchemaBase } from '$lib/common/schema/flowchartSchema';
import { z } from 'zod';

export const generatePDFSchema = z.object({
  flowchartId: flowchartValidationSchemaBase.shape.id
});
