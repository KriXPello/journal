import Fuse from 'fuse.js';
import type { Item, Suggestion } from '~/shared/types';
import { DEFAULT_FUSE_OPTIONS } from './options';

const buildFieldSuggestionCandidates = (items: Item[], fieldId: string): Suggestion[] => {
  const usedValues = new Set<string>();
  const candidates: Suggestion[] = [];

  for (const item of items) {
    const value = item.data[fieldId];
    if (value == undefined) {
      continue;
    }

    const text = String(value).trim();
    if (text === '' || usedValues.has(text)) {
      continue;
    }

    usedValues.add(text);
    candidates.push({
      text,
      key: item.id,
    });
  }

  return candidates;
};

export const searchFieldSuggestions = (
  items: Item[],
  fieldId: string,
  query: string,
): Suggestion[] => {
  const trimmedQuery = query.trim();
  if (trimmedQuery === '') {
    return [];
  }

  const candidates = buildFieldSuggestionCandidates(items, fieldId);
  const fuse = new Fuse(candidates, {
    ...DEFAULT_FUSE_OPTIONS,
    keys: ['text'],
  });

  return fuse.search(trimmedQuery).map(result => result.item);
};
