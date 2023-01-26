import argon2 from 'argon2';
import { fail, redirect } from '@sveltejs/kit';
import { loginValidationSchema } from '$lib/schema/loginSchema';
import { getUserByEmail } from '$lib/server/db/user';
import { upsertSession } from '$lib/server/db/session';
import { SESSION_MAX_AGE } from '$lib/config/envConfig.server';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { UserLoginData } from '$lib/schema/loginSchema';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = Object.fromEntries(await request.formData()) as UserLoginData;

    try {
      // validation
      const parseResults = loginValidationSchema.safeParse(data);
      if (parseResults.success) {
        // user existence + password auth
        const user = await getUserByEmail(parseResults.data.email);
        if (!user || !(await argon2.verify(user.password, parseResults.data.password))) {
          return fail(401, {
            success: false,
            data: {
              email: parseResults.data.email
            }
          });
        }

        // auth successful, create a new session
        const sessionId = await upsertSession(user.id);
        cookies.set('sId', sessionId, {
          maxAge: SESSION_MAX_AGE
        });
      } else {
        const { fieldErrors: loginValidationErrors } = parseResults.error.flatten();

        return fail(400, {
          success: false,
          data: {
            email: data?.email
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

    // will only make it here if login was successful
    console.log('login successful, redirecting');
    throw redirect(303, '/flows');
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
