import * as nodeMailerConfig from '$lib/server/config/nodeMailerConfig';
import * as apiDataConfig from '$lib/server/config/apiDataConfig';
import { env } from '$env/dynamic/private';
import { execSync } from 'child_process';
import { initLogger } from '$lib/common/config/loggerConfig';

const logger = initLogger('Config/EnvConfig');

export let FULL_VERSION_STRING = 'unknown';

// see flowchartSchema for details
export const dataModelVersion = 7;

// session max age in seconds
export const SESSION_MAX_AGE = 60 * 60 * 24;

export async function loadEnv(): Promise<void> {
  // env stuff specific to server
  try {
    const commit = execSync('git rev-parse --short HEAD').toString().slice(0, -1);
    FULL_VERSION_STRING = `${env.npm_package_version} ${commit}`;
  } catch (e) {
    logger.error('Failed to get git version for full version string');
  } finally {
    logger.info(`Hello world! Initializing PolyFlowBuilder ${FULL_VERSION_STRING} ...`);
  }

  logger.info('Environment working directory is', process.cwd());

  // now check to make sure they're actually loaded and exit otherwise
  if (!env.DOMAIN) {
    logger.error('ENVIRONMENT VARIABLES FAILED TO LOAD! Exiting ...');
    process.exit(-1);
  }

  logger.info('Environment variables loaded, initializing dependency configurations ...');

  // setup things that depend on env vars here
  nodeMailerConfig.init();
  await apiDataConfig.init();

  logger.info('PolyFlowBuilder environment initialization complete');
}
