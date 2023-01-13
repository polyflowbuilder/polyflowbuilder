import { loadEnv } from '$lib/config/envConfig.server';
import type { Handle } from '@sveltejs/kit';

// initialize environment
await loadEnv().catch((err) => {
  console.log('An error occurred during environment initialization');
  process.exit(-1);
});

console.log('ready!');
export const handle: Handle = async ({ event, resolve }) => {
  return await resolve(event);
};
