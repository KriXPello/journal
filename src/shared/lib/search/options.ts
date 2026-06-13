import type { IFuseOptions } from 'fuse.js';

export const DEFAULT_FUSE_OPTIONS = {
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 1,
  shouldSort: true,
} satisfies IFuseOptions<unknown>;
