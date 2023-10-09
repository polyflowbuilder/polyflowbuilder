// catalog search parameters
export const MAX_SEARCH_RESULTS_RETURN_COUNT = 24;

// TODO: doesn't belong here
export const SANITIZE_REGEX = (input: string): string =>
  input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
