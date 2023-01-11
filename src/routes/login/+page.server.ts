import { fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = Object.fromEntries(await request.formData());

    try {
      console.log('login data', data);
      return {
        success: true
      };
    } catch (error) {
      console.log('an internal error occurred', error);
      return fail(500, {
        error: true
      });
    }
  }
};
