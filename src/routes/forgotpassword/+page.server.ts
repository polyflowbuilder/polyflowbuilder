import { fail } from '@sveltejs/kit';
import { initLogger } from '$lib/config/loggerConfig';
import { startPWResetRoutine } from '$lib/server/util/pwResetUtil';
import { forgotPasswordSchema } from '$lib/schema/forgotPasswordSchema';
import { redirectIfAuthenticated } from '$lib/server/util/authUtil';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const logger = initLogger('ServerRouteHandler (/forgotpassword');

// TODO: load function to redirect if we're authenticated
export const actions: Actions = {
  default: async ({ request }) => {
    try {
      const data = Object.fromEntries(await request.formData());

      // validation
      const parseResults = forgotPasswordSchema.safeParse(data);
      if (parseResults.success) {
        // start password reset flow
        await startPWResetRoutine(parseResults.data.email);

        return {
          success: true
        };
      } else {
        const { fieldErrors: forgotPasswordValidationErrors } = parseResults.error.flatten();

        return fail(400, {
          success: false,
          data: {
            email: data?.email
          },
          forgotPasswordValidationErrors
        });
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
