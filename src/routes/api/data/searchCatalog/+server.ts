import { json } from '@sveltejs/kit';
import { apiData } from '$lib/server/config/apiDataConfig';
import { initLogger } from '$lib/common/config/loggerConfig';
import { searchCatalogSchema } from '$lib/server/schema/searchCatalogSchema';
import { performCatalogSearch } from '$lib/common/util/catalogSearchUtil';
import type { RequestHandler } from '@sveltejs/kit';

const logger = initLogger('APIRouteHandler (/api/data/searchCatalog)');

export const GET: RequestHandler = ({ locals, url }) => {
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
      const catalogCourses = apiData.courseData.find(
        (cache) => cache.catalog === parseResults.data.catalog
      );

      if (!catalogCourses) {
        throw new Error(`Unable to find catalog ${parseResults.data.catalog} in API catalog data`);
      }

      const searchResults = performCatalogSearch(parseResults.data.query, catalogCourses.courses);

      return json({
        message: 'Catalog search request successful.',
        results: searchResults
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
        message: 'An error occurred while performing catalog search, please try again a bit later.'
      },
      {
        status: 500
      }
    );
  }
};
