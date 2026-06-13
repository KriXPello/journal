import { describe, expect, it } from 'vitest';
import type { Item } from '~/shared/types';
import { resolveSearchFieldIds, searchCollectionItems } from './collection-items';

const titleFieldId = 'field-title';
const yearFieldId = 'field-year';

const items: Item[] = [
  {
    id: 'item-1',
    collectionId: 'collection-1',
    data: {
      [titleFieldId]: 'Inception',
      [yearFieldId]: '2010',
    },
  },
  {
    id: 'item-2',
    collectionId: 'collection-1',
    data: {
      [titleFieldId]: 'Interstellar',
      [yearFieldId]: '2014',
    },
  },
];

const allFieldIds = [titleFieldId, yearFieldId];

describe('resolveSearchFieldIds', () => {
  it('returns no fields when nothing is selected', () => {
    expect(resolveSearchFieldIds([], allFieldIds)).toEqual([]);
  });

  it('returns all fields when every field is selected', () => {
    expect(resolveSearchFieldIds(allFieldIds, allFieldIds)).toEqual(allFieldIds);
  });

  it('returns only selected fields for partial selection', () => {
    expect(resolveSearchFieldIds([titleFieldId], allFieldIds)).toEqual([titleFieldId]);
  });
});

describe('searchCollectionItems', () => {
  it('returns all items for an empty query', () => {
    expect(searchCollectionItems(items, '', {
      selectedFieldIds: [],
      allFieldIds,
    })).toEqual(items);
  });

  it('finds items by exact substring match', () => {
    const result = searchCollectionItems(items, 'Inception', {
      selectedFieldIds: allFieldIds,
      allFieldIds,
    });

    expect(result.map(item => item.id)).toEqual(['item-1']);
  });

  it('finds items with typos', () => {
    const result = searchCollectionItems(items, 'Incepton', {
      selectedFieldIds: allFieldIds,
      allFieldIds,
    });

    expect(result.map(item => item.id)).toEqual(['item-1']);
  });

  it('returns all items when no fields are selected', () => {
    const result = searchCollectionItems(items, 'Inception', {
      selectedFieldIds: [],
      allFieldIds,
    });

    expect(result).toEqual(items);
  });

  it('searches only selected fields', () => {
    const byTitle = searchCollectionItems(items, '2010', {
      selectedFieldIds: [titleFieldId],
      allFieldIds,
    });
    const byYear = searchCollectionItems(items, 'Inception', {
      selectedFieldIds: [yearFieldId],
      allFieldIds,
    });

    expect(byTitle).toEqual([]);
    expect(byYear).toEqual([]);
  });

  it('searches all fields when every field is selected', () => {
    const result = searchCollectionItems(items, 'Interstellar', {
      selectedFieldIds: allFieldIds,
      allFieldIds,
    });

    expect(result.map(item => item.id)).toEqual(['item-2']);
  });
});
