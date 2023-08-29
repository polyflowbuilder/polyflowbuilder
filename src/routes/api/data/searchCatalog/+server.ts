import { json } from '@sveltejs/kit';
import { Prisma } from '@prisma/client';
import { initLogger } from '$lib/common/config/loggerConfig';
import { searchCatalog } from '$lib/server/db/course';
import { searchCatalogSchema } from '$lib/server/schema/searchCatalogSchema';
import type { RequestHandler } from '@sveltejs/kit';

const logger = initLogger('APIRouteHandler (/api/data/searchCatalog)');

export const GET: RequestHandler = async ({ locals, url }) => {
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
    const data = Object.fromEntries(url.searchParams);
    const parseResults = searchCatalogSchema.safeParse(data);
    if (parseResults.success) {
      try {
        const searchResults = await searchCatalog(
          parseResults.data.catalog,
          parseResults.data.query,
          parseResults.data.field
        );

        return json({
          message: 'Catalog search request successful.',
          results: searchResults
        });
      } catch (error) {
        // query valid check bc some queries can be invalid
        // see https://dev.mysql.com/doc/refman/8.0/en/fulltext-boolean.html
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.meta?.code === '1064') {
          return json(
            {
              message: 'The search query is invalid.'
            },
            {
              status: 400
            }
          );
        }
        throw error;
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
        message: 'An error occurred while performing catalog search, please try again a bit later.'
      },
      {
        status: 500
      }
    );
  }
};
