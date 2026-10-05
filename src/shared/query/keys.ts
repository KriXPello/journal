import type { DateObject } from '~/shared/types';

export const COLLECTION_QUERY_KEYS = {
  root: ['collections'] as const,
  byId: (id: string) => [...COLLECTION_QUERY_KEYS.root, id] as const,
};

export const ITEM_QUERY_KEYS = {
  root: ['items'] as const,
  byId: (id: string) => [...ITEM_QUERY_KEYS.root, id] as const,
  byCollection: (collectionId: string) =>
    [...ITEM_QUERY_KEYS.root, 'by-collection', collectionId] as const,
};

export const GROUP_QUERY_KEYS = {
  root: ['collection-groups'] as const,
  byCollection: (collectionId: string) => [...GROUP_QUERY_KEYS.root, collectionId] as const,
};

export const foodTakeDateKey = (date: DateObject) =>
  `${date.year}-${date.month}-${date.day}`;

export const FOOD_TAKE_QUERY_KEYS = {
  root: ['food-takes'] as const,
  byDate: (date: DateObject) =>
    [...FOOD_TAKE_QUERY_KEYS.root, foodTakeDateKey(date)] as const,
};
