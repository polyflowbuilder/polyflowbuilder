import * as nodeMailerConfig from '$lib/config/nodeMailerConfig.server';
import { env } from '$env/dynamic/private';
import { execSync } from 'child_process';
import { initLogger } from '$lib/config/loggerConfig';

const logger = initLogger('Config/EnvConfig');

export let FULL_VERSION_STRING = 'unknown';

export const dataModelVersion = 6;
// TODO: use zod to validate flowchart objects?
/* v6 (associated w/ 2.0 update):
 *   1. UserQuarter:
 *        a. qUnits & qUnitsMax --> tUnits as string
 *        b. qIndex --> tIndex (still int, -1 for creditbin)
 *        c. tIndex of -1 is now REQUIRED! as this is creditBin data
 *   2. UserCourse:
 *        a. classId --> cID (to address discrepancy btwn. user and API course data)
 *        b. cCustomCardTitle --> cCustomID (more appropriate name for property)
 *        c. cCustomCardDisplayName --> cCustomDisplayName (more appropriate name for property)
 *        d. if cID is null, cCustomID MUST NOT BE NULL! Add in a placeholder if it is
 *        e. cardColor MUST be in HEX format (#XXXXXX) (all caps)
 *        f. add cProgramIDIndex property to assign each course to a particular program (indexes into flowId[] to get the program).
 *           if undefined/missing for a course this means its associated with the FIRST program in the flowchart
 *   3. Flowchart:
 *        a. flowCatalogYear, flowMajor, flowConcentration --> flowId (matches program metadata, can deconstruct in derived store)
 *        b. cbData --> append to quarter data, but with a tIndex of -1
 *        c. flowHash is now a required property, and is an MD5 hash based on the following flowchart props:
 *           1. flowName
 *           2. flowId
 *           3. flowStartYear
 *           4. flowUnitTotal
 *           5. flowNotes
 *           6. data
 *           7. dataModelVersion
 *        d. publishedID: string UUID if this flow is published, explicitly null if it's not
 *        e. importedID: takes the format of [string UUID].[contentFlowHash] if this flow is imported, explicitly null if it's not
 *   4. DBTemplateFlowchartModel:
 *        a. flowName --> flowId (matches program metadata) (keeping other fields in case we want to search them one day)
 */

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
  //   await apiDataConfig.init();

  logger.info('PolyFlowBuilder environment initialization complete');
}
