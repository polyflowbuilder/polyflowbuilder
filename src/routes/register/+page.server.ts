import { initLogger } from '$lib/config/loggerConfig';
import { fail, redirect } from '@sveltejs/kit';
import { redirectIfAuthenticated } from '$lib/server/util/authUtil';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { UserRegistrationData } from '$lib/schema/registerSchema';

const logger = initLogger('ServerRouteHandler (/register');

export const actions: Actions = {
  default: async ({ request, cookies, fetch }) => {
    try {
      const data = Object.fromEntries(await request.formData()) as UserRegistrationData;

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      switch (res.status) {
        case 201: {
          // fall out of switch statement to throw redirect
          break;
        }
        case 400: {
          const resBody = await res.json();
          if (resBody.message === 'An account with this email already exists.') {
            return fail(400, {
              success: false,
              userExists: true,
              data: {
                username: data.username,
                email: data.email
              }
            });
          } else {
            return fail(400, {
              success: false,
              data: {
                username: data?.username,
                email: data?.email
              },
              registerValidationErrors: resBody.validationErrors
            });
          }
        }
        case 500: {
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

    // will only make it here if registration was successful
    cookies.set('redirectFromRegister', '1');
    throw redirect(303, '/login');
  }
};

export const load: PageServerLoad = (event) => {
  redirectIfAuthenticated(event);
};
