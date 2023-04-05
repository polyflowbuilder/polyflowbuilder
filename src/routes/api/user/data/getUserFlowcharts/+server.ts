import { json } from '@sveltejs/kit';
import { initLogger } from '$lib/common/config/loggerConfig';
import { getUserFlowcharts } from '$lib/server/db/flowchart';
import type { RequestHandler } from '@sveltejs/kit';

const logger = initLogger('APIRouteHandler (/api/user/data/getUserFlowcharts)');

export const GET: RequestHandler = async ({ locals }) => {
  try {
    // ensure user is authenticated
    if (!locals.session) {
      return json(
        {
          message: 'Request was unauthenticated. Please authenticate and try again.'
        },
        {
          status: 401
        }
      );
    }

    // get user data
    const userFlowcharts = (await getUserFlowcharts(locals.session.id)).map(
      ({ flowchart }) => flowchart
    );
    return json({
      message: 'User flowchart retrieval successful.',
      flowcharts: userFlowcharts
    });
  } catch (error) {
    logger.error('an internal error occurred', error);
    return json(
      {
        message: 'An error occurred while fetching user flowcharts, please try again a bit later.'
      },
      {
        status: 500
      }
    );
  }
};
