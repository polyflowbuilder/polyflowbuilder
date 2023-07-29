/* eslint-disable @typescript-eslint/no-throw-literal */
import { initLogger } from '$lib/common/config/loggerConfig';
import { fail, redirect } from '@sveltejs/kit';
import { redirectIfAuthenticated } from '$lib/server/util/authUtil';
import type { z } from 'zod';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type {
  UserRegistrationData,
  registerValidationSchema
} from '$lib/server/schema/registerSchema';

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
          const resBody = (await res.json()) as {
            message: string;
            validationErrors?: z.inferFlattenedErrors<
              typeof registerValidationSchema
            >['fieldErrors'];
          };
          if (resBody.message === 'An account with this email already exists.') {
            return fail(400, {
              data: {
                userExists: true,
                username: data.username,
                email: data.email,
                // need this explicitly to ensure types are inferred correctly
                registerValidationErrors: undefined
              }
            });
          } else {
            return fail(400, {
              data: {
                // need this explicitly to ensure types are inferred correctly
                userExists: undefined,
                username: data.username,
                email: data.email,
                registerValidationErrors: resBody.validationErrors
              }
            });
          }
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
      logger.error('an internal error occurred', error);
      return fail(500);
    }

    // will only make it here if registration was successful
    cookies.set('redirectFromRegister', '1');
    throw redirect(303, '/login');
  }
};

export const load: PageServerLoad = (event) => {
  redirectIfAuthenticated(event);
};
