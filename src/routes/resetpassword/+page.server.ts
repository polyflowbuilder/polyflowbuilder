import { validateToken } from '$lib/server/db/token';
import { resetPassword } from '$lib/server/util/pwResetUtil';
import { fail, redirect } from '@sveltejs/kit';
import { resetPasswordSchema } from '$lib/schema/resetPasswordSchema';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

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
      console.log('an internal error occurred', error);
      return fail(500, {
        error: true
      });
    }

    // will only make it here if password reset was successful
    console.log('password reset successful, redirecting');
    cookies.set('redirectFromResetPassword', '1');
    throw redirect(303, '/login');
  }
};

export const load: PageServerLoad = async ({ url, cookies }) => {
  // TODO: redirect to homepage if authenticated

  // validate correct URL
  const resetEmail = url.searchParams.get('email');
  const resetToken = url.searchParams.get('token');
  if (resetEmail && resetToken && (await validateToken(resetEmail, resetToken, 'PASSWORD_RESET'))) {
    return {
      resetEmail,
      resetToken
    };
  } else {
    // invalid reset password request, redirect
    cookies.set('redirectFromResetPassword', '1');
    throw redirect(303, '/forgotpassword');
  }
};
