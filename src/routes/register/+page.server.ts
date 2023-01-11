import { fail } from '@sveltejs/kit';
import { registerValidationSchema } from '$lib/config/registerConfig';
import type { Actions } from '@sveltejs/kit';
import type { UserRegistrationData } from '$lib/types/registerTypes';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = Object.fromEntries(await request.formData()) as UserRegistrationData;

    try {
      // validation
      const parseResults = registerValidationSchema.safeParse(data);
      if (parseResults.success) {
        console.log('data is valid!', parseResults.data);
        // TODO: invoke registration business logic here
        return {
          success: true
        };
      } else {
        const { fieldErrors: registerValidationErrors } = parseResults.error.flatten();

        return {
          success: false,
          data: {
            username: data.username,
            email: data.email
          },
          registerValidationErrors
        };
      }
    } catch (error) {
      console.log('an internal error occurred', error);
      return fail(500, {
        error: true
      });
    }
  }
};
