import { json } from '@sveltejs/kit';
import { initLogger } from '$lib/common/config/loggerConfig';
import { generateFlowchart } from '$lib/server/util/flowDataUtil';
import { validateStartYear } from '$lib/server/db/startYear';
import { getProgramsFromIds } from '$lib/server/db/program';
import { generateFlowchartSchema } from '$lib/server/schema/generateFlowchartSchema';
import type { RequestHandler } from '@sveltejs/kit';

const logger = initLogger('APIRouteHandler (/api/data/generateFlowchart)');

export const GET: RequestHandler = async ({ locals, url }) => {
  try {
    // ensure request is authenticated
    if (!locals.session) {
      return json(
        {
          message: 'Generate flowchart request must be authenticated.'
        },
        {
          status: 401
        }
      );
    }

    // validation
    const data = Object.fromEntries(url.searchParams) as Record<string, string | undefined>;
    const parseResults = generateFlowchartSchema.safeParse({
      // convert from string-encoded data
      ...data,
      ownerId: locals.session.id,
      programIds: data.programIds?.split(','),
      removeGECourses: data.removeGECourses ? data.removeGECourses === 'true' : undefined,
      generateCourseCache: data.generateCourseCache
        ? data.generateCourseCache === 'true'
        : undefined
    });
    if (parseResults.success) {
      // fetch start years and program data to do additional validation
      const startYearValid = await validateStartYear(parseResults.data.startYear);
      const programMetadata = await getProgramsFromIds(parseResults.data.programIds);

      // validate start year
      if (!startYearValid) {
        return json(
          {
            message: 'Invalid start year.'
          },
          {
            status: 400
          }
        );
      }

      // validate programIds
      const programIdsSet = new Set(parseResults.data.programIds);
      const invalidProgramIds = programMetadata
        .map((prog) => prog.id)
        .filter((id) => !programIdsSet.has(id));
      if (invalidProgramIds.length) {
        return json(
          {
            message: `Invalid program IDs ${invalidProgramIds.toString()}.`
          },
          {
            status: 400
          }
        );
      }

      const { flowchart: generatedFlowchart, courseCache } = await generateFlowchart(
        parseResults.data,
        programMetadata
      );

      return json({
        message: 'Flowchart successfully generated.',
        generatedFlowchart,
        ...(parseResults.data.generateCourseCache && {
          courseCache
        })
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
        message: 'An error occurred while generating new flowchart, please try again a bit later.'
      },
      {
        status: 500
      }
    );
  }
};
