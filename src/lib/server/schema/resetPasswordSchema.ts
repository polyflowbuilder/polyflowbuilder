import { z } from 'zod';

// validation schema for reset password
export const resetPasswordSchema = z
  .object({
    resetEmail: z
      .string({ required_error: 'Email address is required.' })
      .email({ message: 'Email must be a valid email address.' }),
    resetToken: z.string({ required_error: 'Token is required.' }),
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

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
