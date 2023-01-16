import argon2 from 'argon2';
import { fail, redirect } from '@sveltejs/kit';
import { registerValidationSchema } from '$lib/config/registerConfig';
import { createUser } from '$lib/server/db/user';
import type { Actions } from '@sveltejs/kit';
import type { UserRegistrationData } from '$lib/types';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = Object.fromEntries(await request.formData()) as UserRegistrationData;

    try {
      // validation
      const parseResults = registerValidationSchema.safeParse(data);
      if (parseResults.success) {
        // attempt to add user to DB
        const createUserResult = await createUser({
          username: data.username,
          email: data.email,
          hashedPassword: await argon2.hash(data.password, { type: argon2.argon2id })
        });

        if (createUserResult === null) {
          return fail(400, {
            success: false,
            userExists: true,
            data: {
              username: data.username,
              email: data.email
            }
          });
        }
      } else {
        const { fieldErrors: registerValidationErrors } = parseResults.error.flatten();

        return fail(400, {
          success: false,
          data: {
            username: data.username,
            email: data.email
          },
          registerValidationErrors
        });
      }
    } catch (error) {
      console.log('an internal error occurred', error);
      return fail(500, {
        error: true
      });
    }

    // will only make it here if registration was successful
    throw redirect(303, '/login');
  }
};
