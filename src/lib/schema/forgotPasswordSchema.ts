import { z } from 'zod';

// validation schema for forgot password
export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email address is required.' })
    .email({ message: 'Email must be a valid email address.' })
});
