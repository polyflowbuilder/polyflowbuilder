import argon2 from 'argon2';
import { fail } from '@sveltejs/kit';
import { loginValidationSchema } from '$lib/schema/loginSchema';
import { getUserByEmail } from '$lib/server/db/user';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { UserLoginData } from '$lib/schema/loginSchema';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = Object.fromEntries(await request.formData()) as UserLoginData;

    try {
      // validation
      const parseResults = loginValidationSchema.safeParse(data);
      if (parseResults.success) {
        // user existence + password auth
        const user = await getUserByEmail(data.email);
        if (!user || !(await argon2.verify(user.password, data.password))) {
          return fail(401, {
            success: false,
            data: {
              email: data.email
            }
          });
        }

        // TODO: auth successful, create a new session
        console.log('login successful!');
      } else {
        const { fieldErrors: loginValidationErrors } = parseResults.error.flatten();

        return fail(400, {
          success: false,
          data: {
            email: data.email
          },
          loginValidationErrors
        });
      }
    } catch (error) {
      console.log('an internal error occurred', error);
      return fail(500, {
        error: true
      });
    }
  }
};

export const load: PageServerLoad = ({ locals }) => {
  // for ephemeral login page notifs
  if (locals.misc?.cameFromRegister) {
    return {
      cameFromRegister: true
    };
  }
};
