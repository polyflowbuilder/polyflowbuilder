import { redirectIfAnonymous } from '$lib/server/util/authUtil';

export const load = async (event) => {
  redirectIfAnonymous(event);
};
