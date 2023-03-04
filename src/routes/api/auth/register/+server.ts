import { json } from '@sveltejs/kit';
import { createUser } from '$lib/server/db/user';
import { initLogger } from '$lib/common/config/loggerConfig';
import { registerValidationSchema } from '$lib/server/schema/registerSchema';
import type { RequestHandler } from '@sveltejs/kit';
import type { UserRegistrationData } from '$lib/server/schema/registerSchema';

const logger = initLogger('APIRouteHandler (/api/auth/register');

export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = (await request.json()) as UserRegistrationData;

    // validation
    const parseResults = registerValidationSchema.safeParse(data);
    if (parseResults.success) {
      // attempt to add user to DB
      const createUserResult = await createUser({
        username: parseResults.data.username,
        email: parseResults.data.email,
        password: parseResults.data.password
      });

      if (createUserResult === null) {
        return json(
          {
            message: 'An account with this email already exists.'
          },
          {
            status: 400
          }
        );
      } else {
        return json(
          {
            message: 'Account successfully created.'
          },
          {
            status: 201
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
        message: 'An error occurred while creating the new account, please try again later.'
      },
      {
        status: 500
      }
    );
  }
};
