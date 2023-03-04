import { json } from '@sveltejs/kit';
import { initLogger } from '$lib/config/loggerConfig';
import { startPWResetRoutine } from '$lib/server/util/pwResetUtil';
import { forgotPasswordSchema } from '$lib/server/schema/forgotPasswordSchema';
import type { RequestHandler } from '@sveltejs/kit';

const logger = initLogger('APIRouteHandler (/api/auth/forgotpassword');

export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();

    // validation
    const parseResults = forgotPasswordSchema.safeParse(data);
    if (parseResults.success) {
      // start password reset flow
      await startPWResetRoutine(parseResults.data.email);

      return json(
        {
          message: 'Reset password request successfully initiated.'
        },
        {
          status: 201
        }
      );
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
        message:
          'An error occurred while initiating reset password request, please try again a bit later.'
      },
      {
        status: 500
      }
    );
  }
};
