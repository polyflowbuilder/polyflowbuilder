import { initLogger } from '$lib/config/loggerConfig';
import { validateToken } from '$lib/server/db/token';
import { resetPassword } from '$lib/server/util/pwResetUtil';
import { fail, redirect } from '@sveltejs/kit';
import { resetPasswordSchema } from '$lib/schema/resetPasswordSchema';
import { redirectIfAuthenticated } from '$lib/server/util/authUtil';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const logger = initLogger('ServerRouteHandler (/resetpassword)');

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    try {
      const data = Object.fromEntries(await request.formData());
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

          logger.info(
            'password reset successful for user',
            parseResults.data.resetEmail,
            'redirecting'
          );
        } else {
          return fail(401, {
            success: false,
            tokenExpired: true
          });
        }
      } else {
        const { fieldErrors: resetPasswordValidationErrors } = parseResults.error.flatten();

        return fail(400, {
          success: false,
          resetPasswordValidationErrors
        });
      }
    } catch (error) {
      logger.error('an internal error occurred', error);
      return fail(500, {
        error: true
      });
    }

    // will only make it here if password reset was successful
    cookies.set('redirectFromResetPassword', '1');
    throw redirect(303, '/login');
  }
};

export const load: PageServerLoad = async (event) => {
  redirectIfAuthenticated(event);

  // validate correct URL
  const resetEmail = event.url.searchParams.get('email');
  const resetToken = event.url.searchParams.get('token');
  if (resetEmail && resetToken && (await validateToken(resetEmail, resetToken, 'PASSWORD_RESET'))) {
    return {
      resetEmail,
      resetToken
    };
  } else {
    // invalid reset password request, redirect
    event.cookies.set('redirectFromResetPassword', '1');
    throw redirect(303, '/forgotpassword');
  }
};
