import { json } from '@sveltejs/kit';
import { initLogger } from '$lib/common/config/loggerConfig';
import { updateUserFlowchartsSchema } from '$lib/server/schema/updateUserFlowchartsSchema';
import { persistUserDataChangesServer } from '$lib/server/util/mutateUserDataUtilServer';
import type { RequestHandler } from '@sveltejs/kit';

const logger = initLogger('APIRouteHandler (/api/user/data/updateUserFlowcharts)');

export const POST: RequestHandler = async ({ request, locals }) => {
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

    // validation
    const data = await request.json();
    const parseResults = updateUserFlowchartsSchema.safeParse(data);
    if (parseResults.success) {
      // perform persist
      logger.info(`Updating user flowchart data for user ${locals.session.id}`);
      const success = await persistUserDataChangesServer(
        locals.session.id,
        parseResults.data.updateChunks
      );

      if (success) {
        return json(
          {
            message: 'User flowchart data changes successfully persisted.'
          },
          {
            status: 200
          }
        );
      } else {
        return json(
          {
            message: 'Requested user flowchart updates are not valid for these data.'
          },
          {
            status: 400
          }
        );
      }
    } else {
      const { fieldErrors: validationErrors } = parseResults.error.flatten();

      return json(
        {
          message: 'Invalid input received.',
          validationErrors
        },
        {
          status: 400
        }
      );
    }
  } catch (error) {
    logger.error('an internal error occurred', error);
    return json(
      {
        message: 'An error occurred while updating user flowcharts, please try again a bit later.'
      },
      {
        status: 500
      }
    );
  }
};
