import { json } from '@sveltejs/kit';
import { initLogger } from '$lib/common/config/loggerConfig';
import { getStartYears } from '$lib/server/db/startYear';
import type { RequestHandler } from '@sveltejs/kit';

const logger = initLogger('APIRouteHandler (/api/data/getAvailableStartYears)');

export const GET: RequestHandler = async ({ locals }) => {
  try {
    // ensure request is authenticated
    if (!locals.session) {
      return json(
        {
          message: 'Request must be authenticated.'
        },
        {
          status: 401
        }
      );
    }

    // return the data
    return json({
      startYears: await getStartYears()
    });
  } catch (error) {
    logger.error('an internal error occurred', error);
    return json(
      {
        message:
          'An error occurred while fetching available start years, please try again a bit later.'
      },
      {
        status: 500
      }
    );
  }
};
