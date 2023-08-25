import { json } from '@sveltejs/kit';
import { initLogger } from '$lib/common/config/loggerConfig';
import { queryAvailableMajorsSchema } from '$lib/server/schema/queryAvailableMajorsSchema';
import { getProgramMajorsFromCatalog } from '$lib/server/db/program';
import type { RequestHandler } from '@sveltejs/kit';

const logger = initLogger('APIRouteHandler (/api/data/queryAvailableMajors)');

export const GET: RequestHandler = async ({ locals, url }) => {
  try {
    // ensure request is authenticated
    if (!locals.session) {
      return json(
        {
          message: 'Available majors query request must be authenticated.'
        },
        {
          status: 401
        }
      );
    }

    // validation
    const data = Object.fromEntries(url.searchParams);
    const parseResults = queryAvailableMajorsSchema.safeParse({
      query: data
    });

    if (parseResults.success) {
      const results = await getProgramMajorsFromCatalog(parseResults.data.query.catalog);

      return json({
        message: 'Available majors query successful.',
        results
      });
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
        message: 'An error occurred while querying available majors, please try again a bit later.'
      },
      {
        status: 500
      }
    );
  }
};
