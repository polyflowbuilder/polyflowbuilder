import argon2 from 'argon2';
import { json } from '@sveltejs/kit';
import { initLogger } from '$lib/config/loggerConfig';
import { upsertToken } from '$lib/server/db/token';
import { getUserByEmail } from '$lib/server/db/user';
import { SESSION_MAX_AGE } from '$lib/config/envConfig.server';
import { loginValidationSchema } from '$lib/schema/loginSchema';
import type { RequestHandler } from '@sveltejs/kit';
import type { UserLoginData } from '$lib/schema/loginSchema';

const logger = initLogger('APIRouteHandler (/api/auth/login)');

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const data = (await request.json()) as UserLoginData;

    // validation
    const parseResults = loginValidationSchema.safeParse(data);
    if (parseResults.success) {
      // user existence + password auth
      const user = await getUserByEmail(parseResults.data.email);
      if (!user || !(await argon2.verify(user.password, parseResults.data.password))) {
        return json(
          {
            message: 'Incorrect email address or password.'
          },
          {
            status: 401
          }
        );
      }

      // auth successful, create a new session
      const sessionExpiry = new Date(Date.now() + 1000 * SESSION_MAX_AGE);
      const sessionId = await upsertToken(user.email, 'SESSION', sessionExpiry);

      if (sessionId) {
        cookies.set('sId', sessionId, {
          maxAge: SESSION_MAX_AGE,
          path: '/'
        });

        logger.info('login attempt for user', parseResults.data.email, 'successful');

        return json(
          {
            message: 'User authentication successful.'
          },
          {
            status: 303,
            headers: {
              Location: '/flows'
            }
          }
        );
      } else {
        logger.error('an error occurred while creating session');

        return json(
          {
            message: 'An error occurred while creating the user session, please try again later.'
          },
          {
            status: 500
          }
        );
      }
    } else {
      const { fieldErrors: validationErrors } = parseResults.error.flatten();

      return json(
        {
          message: 'Invalid input received.',
          validationErrors
        },
        {
          status: 400
        }
      );
    }
  } catch (error) {
    logger.error('an internal error occurred', error);

    return json(
      {
        message: 'An error occurred while authenticating user, please try again later.'
      },
      {
        status: 500
      }
    );
  }
};
