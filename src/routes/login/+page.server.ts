/* eslint-disable @typescript-eslint/no-throw-literal */
import { initLogger } from '$lib/common/config/loggerConfig';
import { fail, redirect } from '@sveltejs/kit';
import { redirectIfAuthenticated } from '$lib/server/util/authUtil';
import type { z } from 'zod';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { UserLoginData, loginValidationSchema } from '$lib/server/schema/loginSchema';

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
          const resData = (await res.json()) as {
            validationErrors: z.inferFlattenedErrors<typeof loginValidationSchema>['fieldErrors'];
          };
          return fail(400, {
            data: {
              email: data.email,
              loginValidationErrors: resData.validationErrors
            }
          });
        }
        case 401: {
          return fail(401, {
            data: {
              email: data.email,
              // need this explicitly to ensure types are inferred correctly
              loginValidationErrors: undefined
            }
          });
        }
        case 500: {
          return fail(500);
        }
        default: {
          logger.error('Unexpected response code received:', res.status);
          return fail(500);
        }
      }
    } catch (error) {
      logger.error('An internal error occurred', error);
      return fail(500);
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
