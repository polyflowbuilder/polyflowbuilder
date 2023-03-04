import { initLogger } from '$lib/common/config/loggerConfig';
import { validateToken } from '$lib/server/db/token';
import { fail, redirect } from '@sveltejs/kit';
import { redirectIfAuthenticated } from '$lib/server/util/authUtil';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const logger = initLogger('ServerRouteHandler (/resetpassword)');

export const actions: Actions = {
  default: async ({ request, cookies, fetch }) => {
    try {
      const data = Object.fromEntries(await request.formData());

      const res = await fetch('/api/auth/resetpassword', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      switch (res.status) {
        case 200: {
          // fall out of switch statement to throw redirect
          break;
        }
        case 400: {
          const resData = await res.json();
          return fail(400, {
            success: false,
            resetPasswordValidationErrors: resData.validationErrors
          });
        }
        case 401: {
          return fail(401, {
            success: false,
            tokenExpired: true
          });
        }
        case 500: {
          return fail(500, {
            error: true
          });
        }
        default: {
          logger.error('Unexpected response code received:', res.status);
          return fail(500, {
            error: true
          });
        }
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
