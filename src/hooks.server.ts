import { loadEnv } from '$lib/server/config/envConfig';
import { initLogger } from '$lib/common/config/loggerConfig';
import { getValidTokenUser } from '$lib/server/db/token';
import type { Handle, RequestEvent, HandleServerError } from '@sveltejs/kit';

const logger = initLogger('Hooks');

// initialize environment
try {
  loadEnv();
} catch (error) {
  logger.error('An error occurred during environment initialization', error);
  process.exit(-1);
}

export const handle: Handle = async ({ event, resolve }) => {
  await setSession(event);
  return await resolve(event);
};

async function setSession(event: RequestEvent) {
  const sessionId = event.cookies.get('sId') ?? '';
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
    logger.error('An internal error has occurred:', error, event);
  }
};
