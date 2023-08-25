import { json } from '@sveltejs/kit';
import { initLogger } from '$lib/common/config/loggerConfig';
import { queryAvailableProgramsValidationSchema } from '$lib/server/schema/queryAvailableProgramsSchema';
import { getProgramsFromCatalogMajor, getProgramsFromIds } from '$lib/server/db/program';
import type { Program } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';

const logger = initLogger('APIRouteHandler (/api/data/queryAvailablePrograms)');

export const GET: RequestHandler = async ({ locals, url }) => {
  try {
    // ensure request is authenticated
    if (!locals.session) {
      return json(
        {
          message: 'Available programs query request must be authenticated.'
        },
        {
          status: 401
        }
      );
    }

    // validation
    const data = Object.fromEntries(url.searchParams);
    const parseResults = queryAvailableProgramsValidationSchema.safeParse(data);

    if (parseResults.success) {
      let results: Program[] = [];

      if ('id' in parseResults.data) {
        // TODO: enable ability to fetch multiple programs?
        results = await getProgramsFromIds([parseResults.data.id]);
      } else {
        results = await getProgramsFromCatalogMajor(
          parseResults.data.catalog,
          parseResults.data.majorName
        );
      }

      return json({
        message: 'Available programs query successful.',
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
        message:
          'An error occurred while querying available programs, please try again a bit later.'
      },
      {
        status: 500
      }
    );
  }
};
