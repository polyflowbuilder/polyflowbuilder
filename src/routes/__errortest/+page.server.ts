import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// route purely for testing error handling
export const load: PageServerLoad = () => {
  if (env.NODE_ENV === 'test') {
    throw error(500, {
      message: 'Internal Error'
    });
  } else {
    throw error(404, {
      message: 'Not Found'
    });
  }
};
