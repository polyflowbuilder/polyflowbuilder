import { redirectIfAuthenticated } from '$lib/server/util/authUtil';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
  redirectIfAuthenticated(event);
};
