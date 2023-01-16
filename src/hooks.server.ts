import { loadEnv } from '$lib/config/envConfig.server';
import type { Handle } from '@sveltejs/kit';

// initialize environment
await loadEnv().catch((err) => {
  console.error('An error occurred during environment initialization', err);
  process.exit(-1);
});

export const handle: Handle = async ({ event, resolve }) => {
  // for ephemeral notif in login page after register
  // TODO: security concerns for referer header?
  if (
    event.url.pathname === '/login' &&
    event.request.headers.get('referer') &&
    new URL(event.request.headers.get('referer') as string).pathname === '/register'
  ) {
    event.locals.misc = {
      cameFromRegister: true
    };
  }

  return await resolve(event);
};
