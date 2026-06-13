import Fuse from 'fuse.js';
import type { Item } from '~/shared/types';
import { DEFAULT_FUSE_OPTIONS } from './options';

export const resolveSearchFieldIds = (
  selectedFieldIds: string[],
  allFieldIds: string[],
): string[] => {
  if (
    selectedFieldIds.length === allFieldIds.length
    && allFieldIds.every(id => selectedFieldIds.includes(id))
  ) {
    return allFieldIds;
  }

  return selectedFieldIds;
};

export const searchCollectionItems = (
  items: Item[],
  query: string,
  options: {
    selectedFieldIds: string[];
    allFieldIds: string[];
  },
): Item[] => {
  const trimmedQuery = query.trim();
  if (trimmedQuery === '') {
    return items;
  }

  const fieldIds = resolveSearchFieldIds(options.selectedFieldIds, options.allFieldIds);
  if (fieldIds.length === 0) {
    return items;
  }

  const fuse = new Fuse(items, {
    ...DEFAULT_FUSE_OPTIONS,
    keys: fieldIds.map(id => `data.${id}`),
  });

  const searchResults = fuse.search(trimmedQuery);

  const result = searchResults.map(result => result.item);
  return result;
};
