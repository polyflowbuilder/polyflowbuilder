import { error } from '@sveltejs/kit';

// route purely for testing error handling
export const load = () => {
  if (process.env['NODE_ENV'] === 'test') {
    throw error(500, {
      message: 'Internal Error'
    });
  } else {
    throw error(404, {
      message: 'Not Found'
    });
  }
};
