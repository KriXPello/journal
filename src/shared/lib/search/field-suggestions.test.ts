import { describe, expect, it } from 'vitest';
import type { Item } from '~/shared/types';
import { searchFieldSuggestions } from './field-suggestions';

const fieldId = 'field-title';

const items: Item[] = [
  {
    id: 'item-1',
    collectionId: 'collection-1',
    data: {
      [fieldId]: 'Inception',
    },
  },
  {
    id: 'item-2',
    collectionId: 'collection-1',
    data: {
      [fieldId]: 'Inception',
    },
  },
  {
    id: 'item-3',
    collectionId: 'collection-1',
    data: {
      [fieldId]: 'Interstellar',
    },
  },
];

describe('searchFieldSuggestions', () => {
  it('returns empty list for an empty query', () => {
    expect(searchFieldSuggestions(items, fieldId, '')).toEqual([]);
    expect(searchFieldSuggestions(items, fieldId, '   ')).toEqual([]);
  });

  it('finds suggestions by exact substring match', () => {
    const result = searchFieldSuggestions(items, fieldId, 'Inter');

    expect(result).toEqual([
      {
        text: 'Interstellar',
        key: 'item-3',
      },
    ]);
  });

  it('finds suggestions with typos', () => {
    const result = searchFieldSuggestions(items, fieldId, 'Incepton');

    expect(result).toEqual([
      {
        text: 'Inception',
        key: 'item-1',
      },
    ]);
  });

  it('deduplicates values and keeps the first item id', () => {
    const result = searchFieldSuggestions(items, fieldId, 'Inception');

    expect(result).toEqual([
      {
        text: 'Inception',
        key: 'item-1',
      },
    ]);
  });
});
