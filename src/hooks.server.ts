import { loadEnv } from '$lib/config/envConfig.server';
import type { Handle } from '@sveltejs/kit';

// initialize environment
await loadEnv().catch((err) => {
  console.error('An error occurred during environment initialization', err);
  process.exit(-1);
});

export const handle: Handle = async ({ event, resolve }) => {
  // for ephemeral notif in login page after register
  if (event.url.pathname === '/login' && event.cookies.get('redirectFromRegister')) {
    event.cookies.delete('redirectFromRegister');
    event.locals.misc = {
      cameFromRegister: true
    };
  }

  return await resolve(event);
};
