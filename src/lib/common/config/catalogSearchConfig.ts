// catalog search parameters
export const SEARCH_DELAY_TIME_MS = 500;
export const MAX_SEARCH_RESULTS_RETURN_COUNT = 24;

// TODO: doesn't belong here
export const SANITIZE_REGEX = (input: string): string =>
  input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
