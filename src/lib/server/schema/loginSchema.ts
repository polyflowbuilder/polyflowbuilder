import { z } from 'zod';

// validation schema for user login data
export const loginValidationSchema = z.object({
  email: z
    .string({ required_error: 'Email address is required.' })
    .email({ message: 'Email address must be valid.' }),
  password: z.string({ required_error: 'Password is required.' })
});

export type UserLoginData = z.infer<typeof loginValidationSchema>;
