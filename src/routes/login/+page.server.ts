import { initLogger } from '$lib/common/config/loggerConfig';
import { fail, redirect } from '@sveltejs/kit';
import { redirectIfAuthenticated } from '$lib/server/util/authUtil';
import type { Actions } from '@sveltejs/kit';
import type { UserLoginData } from '$lib/server/schema/loginSchema';
import type { PageServerLoad } from './$types';

const logger = initLogger('ServerRouteHandler (/login)');

export const actions: Actions = {
  default: async ({ request, fetch }) => {
    try {
      const data = Object.fromEntries(await request.formData()) as UserLoginData;

      const res = await fetch('/api/auth/login', {
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
            data: {
              email: data?.email
            },
            loginValidationErrors: resData.validationErrors
          });
        }
        case 401: {
          return fail(401, {
            success: false,
            data: {
              email: data?.email
            }
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
      logger.error('An internal error occurred', error);
      return fail(500, {
        error: true
      });
    }

    // will only make it here if login was successful
    throw redirect(303, '/flows');
  }
};

export const load: PageServerLoad = (event) => {
  redirectIfAuthenticated(event);

  // for ephemeral login page notifs
  if (event.cookies.get('redirectFromRegister')) {
    event.cookies.delete('redirectFromRegister');
    return {
      cameFromRegister: true
    };
  } else if (event.cookies.get('redirectFromResetPassword')) {
    event.cookies.delete('redirectFromResetPassword');
    return {
      cameFromResetPassword: true
    };
  } else if (event.cookies.get('redirectFromUnauthorized')) {
    event.cookies.delete('redirectFromUnauthorized');
    return {
      cameFromUnauthorized: true
    };
  }
};
