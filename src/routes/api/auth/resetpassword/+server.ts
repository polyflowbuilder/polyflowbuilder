import { json } from '@sveltejs/kit';
import { initLogger } from '$lib/config/loggerConfig';
import { validateToken } from '$lib/server/db/token';
import { resetPassword } from '$lib/server/util/pwResetUtil';
import { resetPasswordSchema } from '$lib/server/schema/resetPasswordSchema';
import type { RequestHandler } from '@sveltejs/kit';

const logger = initLogger('APIRouteHandler (/api/auth/resetpassword)');

export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();

    // validation
    const parseResults = resetPasswordSchema.safeParse(data);
    if (parseResults.success) {
      // validate token again before resetting
      const validToken = await validateToken(
        parseResults.data.resetEmail,
        parseResults.data.resetToken,
        'PASSWORD_RESET'
      );
      if (validToken) {
        await resetPassword(parseResults.data.resetEmail, parseResults.data.password);

        logger.info('password reset successful for user', parseResults.data.resetEmail);

        return json(
          {
            message: 'Password reset successful.'
          },
          {
            status: 200
          }
        );
      } else {
        return json(
          {
            message:
              'Password reset token is no longer valid. Please try the password reset process again.'
          },
          {
            status: 401
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
        message: 'An error occurred while performing password reset, please try again a bit later.'
      },
      {
        status: 500
      }
    );
  }
};
