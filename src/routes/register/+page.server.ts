import { createUser } from '$lib/server/db/user';
import { initLogger } from '$lib/config/loggerConfig';
import { fail, redirect } from '@sveltejs/kit';
import { registerValidationSchema } from '$lib/schema/registerSchema';
import { redirectIfAuthenticated } from '$lib/server/util/authUtil';
import type { Actions } from '@sveltejs/kit';
import type { UserRegistrationData } from '$lib/schema/registerSchema';
import type { PageServerLoad } from './$types';

const logger = initLogger('ServerRouteHandler (/register');

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    try {
      const data = Object.fromEntries(await request.formData()) as UserRegistrationData;

      // validation
      const parseResults = registerValidationSchema.safeParse(data);
      if (parseResults.success) {
        // attempt to add user to DB
        const createUserResult = await createUser({
          username: parseResults.data.username,
          email: parseResults.data.email,
          password: parseResults.data.password
        });

        if (createUserResult === null) {
          return fail(400, {
            success: false,
            userExists: true,
            data: {
              username: parseResults.data.username,
              email: parseResults.data.email
            }
          });
        }
      } else {
        const { fieldErrors: registerValidationErrors } = parseResults.error.flatten();

        return fail(400, {
          success: false,
          data: {
            username: data?.username,
            email: data?.email
          },
          registerValidationErrors
        });
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
