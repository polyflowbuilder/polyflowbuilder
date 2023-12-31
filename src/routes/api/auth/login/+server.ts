import argon2 from 'argon2';
import { json } from '@sveltejs/kit';
import { initLogger } from '$lib/common/config/loggerConfig';
import { SESSION_MAX_AGE } from '$lib/server/config/envConfig';
import { loginValidationSchema } from '$lib/server/schema/loginSchema';
import { upsertToken, clearTokensByEmail } from '$lib/server/db/token';
import { getUserByEmail, updateUser, deleteUser } from '$lib/server/db/user';
import type { RequestHandler } from '@sveltejs/kit';

const logger = initLogger('APIRouteHandler (/api/auth/login)');

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const data = (await request.json()) as unknown;

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
        // set session cookie
        cookies.set('sId', sessionId, {
          maxAge: SESSION_MAX_AGE,
          path: '/'
        });

        // update login date
        await updateUser(parseResults.data.email, {
          lastLoginTimeUTC: new Date(Date.now())
        });

        logger.info('login attempt for user', parseResults.data.email, 'successful');

        return json(
          {
            message: 'User authentication successful.'
          },
          {
            status: 200
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

export const DELETE: RequestHandler = async ({ url, locals, cookies }) => {
  try {
    if (locals.session) {
      // perform session delete
      await clearTokensByEmail(locals.session.email, 'SESSION');
      cookies.delete('sId', {
        path: '/'
      });

      // delete account if indicated
      const deleteAcc = url.searchParams.has('deleteAcc');
      if (deleteAcc) {
        await deleteUser(locals.session.email);
      }

      logger.info(
        `User ${locals.session.username} has successfully logged out${
          deleteAcc ? ' and account has been deleted' : ''
        }.`
      );

      return json(
        {
          message: `User successfully logged out${
            deleteAcc ? ' and account has been deleted' : ''
          }.`
        },
        {
          status: 200
        }
      );
    } else {
      logger.warn('Attempted logout on nonexistent session');

      return json(
        {
          message: 'The session either does not exist or is not valid.'
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
        message: 'An error occurred while deleting user account, please try again later.'
      },
      {
        status: 500
      }
    );
  }
};
