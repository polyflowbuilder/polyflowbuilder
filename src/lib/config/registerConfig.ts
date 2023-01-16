import { z } from 'zod';

// validation schema for user registration data
// TODO: add min/max constraints?
export const registerValidationSchema = z
  .object({
    username: z.string({ required_error: 'Username is required.' }),
    email: z
      .string({ required_error: 'Email address is required.' })
      .email({ message: 'Email address must be valid.' }),
    password: z.string({ required_error: 'Password is required.' }),
    passwordConfirm: z.string({ required_error: 'Password confirmation is required.' })
  })
  .superRefine(({ passwordConfirm, password }, ctx) => {
    if (passwordConfirm !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password and Repeat Password fields must match.',
        path: ['password']
      });
      ctx.addIssue({
        code: 'custom',
        message: 'Password and Repeat Password fields must match.',
        path: ['passwordConfirm']
      });
    }
  });
