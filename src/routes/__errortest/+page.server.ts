import { error } from '@sveltejs/kit';

// route purely for testing error handling
export const load = () => {
  if (process.env.NODE_ENV === 'test') {
    error(500, {
      message: 'Internal Error'
    });
  } else {
    error(404, {
      message: 'Not Found'
    });
  }
};
