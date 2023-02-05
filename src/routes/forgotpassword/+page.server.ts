import { fail } from '@sveltejs/kit';
import { initLogger } from '$lib/config/loggerConfig';
import { redirectIfAuthenticated } from '$lib/server/util/authUtil';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const logger = initLogger('ServerRouteHandler (/forgotpassword');

export const actions: Actions = {
  default: async ({ request, fetch }) => {
    try {
      const data = Object.fromEntries(await request.formData());

      const res = await fetch('/api/auth/forgotpassword', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      switch (res.status) {
        case 201: {
          return {
            success: true
          };
        }
        case 400: {
          const resData = await res.json();
          return fail(400, {
            success: false,
            data: {
              email: data?.email
            },
            forgotPasswordValidationErrors: resData.validationErrors
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
  }
};

export const load: PageServerLoad = (event) => {
  redirectIfAuthenticated(event);

  // for ephemeral forgot password notifs
  if (event.cookies.get('redirectFromResetPassword')) {
    event.cookies.delete('redirectFromResetPassword');
    return {
      cameFromResetPassword: true
    };
  }
};
