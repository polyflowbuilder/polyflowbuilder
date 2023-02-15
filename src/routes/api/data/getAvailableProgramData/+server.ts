import { json } from '@sveltejs/kit';
import { apiData } from '$lib/config/apiDataConfig.server';
import { initLogger } from '$lib/config/loggerConfig';
import type { RequestHandler } from '@sveltejs/kit';

const logger = initLogger('APIRouteHandler (/api/data/getAvailableProgramData)');

export const GET: RequestHandler = async () => {
  try {
    return json({
      catalogs: apiData.catalogs,
      startYears: apiData.startYears,
      programData: apiData.programData
    });
  } catch (error) {
    logger.error('an internal error occurred', error);
    return json(
      {
        message:
          'An error occurred while fetching available program data, please try again a bit later.'
      },
      {
        status: 500
      }
    );
  }
};
