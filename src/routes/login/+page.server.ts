import argon2 from 'argon2';
import { fail, redirect } from '@sveltejs/kit';
import { getUserByEmail } from '$lib/server/db/user';
import { SESSION_MAX_AGE } from '$lib/config/envConfig.server';
import { loginValidationSchema } from '$lib/schema/loginSchema';
import { createToken, upsertToken } from '$lib/server/db/token';
import { initLogger } from '$lib/config/loggerConfig';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { UserLoginData } from '$lib/schema/loginSchema';

const logger = initLogger('ServerRouteHandler (/login)');

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    try {
      const data = Object.fromEntries(await request.formData()) as UserLoginData;

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
        const sessionToken = createToken();
        const sessionExpiry = new Date(Date.now() + 1000 * SESSION_MAX_AGE);
        const sessionId = await upsertToken(user.email, 'SESSION', sessionToken, sessionExpiry);

        if (sessionId) {
          cookies.set('sId', sessionId, {
            maxAge: SESSION_MAX_AGE
          });

          logger.info('login attempt for user', parseResults.data.email, 'successful');
        } else {
          logger.error('an error occurred while creating session');
          return fail(500, {
            error: true
          });
        }
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
      logger.error('an internal error occurred', error);
      return fail(500, {
        error: true
      });
    }

    // will only make it here if login was successful
    throw redirect(303, '/flows');
  }
};

export const load: PageServerLoad = ({ cookies }) => {
  // for ephemeral login page notifs
  if (cookies.get('redirectFromRegister')) {
    cookies.delete('redirectFromRegister');
    return {
      cameFromRegister: true
    };
  } else if (cookies.get('redirectFromResetPassword')) {
    cookies.delete('redirectFromResetPassword');
    return {
      cameFromResetPassword: true
    };
  }
};
