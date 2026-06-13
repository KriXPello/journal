import type { IFuseOptions } from 'fuse.js';

export const SEARCH_DEBOUNCE_MS = 300;

export const DEFAULT_FUSE_OPTIONS = {
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2,
  shouldSort: true,
  useTokenSearch: true,
  tokenMatch: 'all',
} satisfies IFuseOptions<unknown>;
