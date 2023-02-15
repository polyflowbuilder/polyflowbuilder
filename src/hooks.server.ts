import { loadEnv } from '$lib/config/envConfig.server';
import { initLogger } from '$lib/config/loggerConfig';
import { getValidTokenUser } from '$lib/server/db/token';
import type { Handle, RequestEvent, HandleServerError } from '@sveltejs/kit';

const logger = initLogger('Hooks');

// initialize environment
await loadEnv().catch((err) => {
  logger.error('An error occurred during environment initialization', err);
  process.exit(-1);
});

export const handle: Handle = async ({ event, resolve }) => {
  await setSession(event);
  return await resolve(event);
};

async function setSession(event: RequestEvent) {
  const sessionId = event.cookies.get('sId') || '';
  const sessionUser = await getValidTokenUser(sessionId, 'SESSION');
  if (sessionUser) {
    event.locals.session = {
      id: sessionUser.id,
      email: sessionUser.email,
      username: sessionUser.username
    };
  }
}

export const handleError: HandleServerError = ({ error, event }) => {
  if (!event.route.id) {
    logger.warn('User attempted to navigate to nonexistent page', event.url.pathname);
  } else {
    logger.error('An internal error has occurred', error, event);
  }
};
