import dotenv from 'dotenv';
import { version } from '$app/environment';
import { initLogger } from '$lib/common/config/loggerConfig';

const logger = initLogger('Config/EnvConfig');

// session max age in seconds
export const SESSION_MAX_AGE = 60 * 60 * 24;

export function loadEnv() {
  // env stuff specific to server
  logger.info(
    `Hello world! Initializing PolyFlowBuilder (commit ${version}, environment ${process.env.NODE_ENV}) ...`
  );

  logger.info('Environment working directory is', process.cwd());

  dotenv.config({
    path: `${process.cwd()}/.env`
  });

  // now check to make sure they're actually loaded and exit otherwise
  if (!process.env.DOMAIN) {
    logger.error('ENVIRONMENT VARIABLES FAILED TO LOAD! Exiting ...');
    process.exit(-1);
  }

  logger.info('Environment variables loaded, initializing dependency configurations ...');

  // setup things that depend on env vars here

  logger.info('PolyFlowBuilder environment initialization complete');
}
