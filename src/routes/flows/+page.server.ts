import { redirectIfAnonymous } from '$lib/server/util/authUtil';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  redirectIfAnonymous(event);
};
