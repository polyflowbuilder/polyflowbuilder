import { loadEnv } from '$lib/config/envConfig.server';
import { initLogger } from '$lib/config/loggerConfig';
import type { Handle } from '@sveltejs/kit';

const logger = initLogger('Hooks');

// initialize environment
await loadEnv().catch((err) => {
  logger.error('An error occurred during environment initialization', err);
  process.exit(-1);
});

export const handle: Handle = async ({ event, resolve }) => {
  return await resolve(event);
};
