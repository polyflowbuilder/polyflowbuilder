import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

// tested in e2e tests

export function redirectIfAnonymous(event: RequestEvent) {
  if (!event.locals.session) {
    // create cookie so we can show unauthorized message
    event.cookies.set('redirectFromUnauthorized', '1', {
      path: '/'
    });
    redirect(307, '/login');
  }
}

export function redirectIfAuthenticated(event: RequestEvent) {
  if (event.locals.session) {
    // TODO: change /flows to current authenticated page
    redirect(307, '/flows');
  }
}
