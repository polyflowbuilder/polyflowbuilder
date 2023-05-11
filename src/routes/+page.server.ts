import { redirectIfAuthenticated } from '$lib/server/util/authUtil';

export const load = (event) => {
  redirectIfAuthenticated(event);
};
