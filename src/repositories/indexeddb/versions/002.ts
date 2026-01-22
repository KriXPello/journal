import type { DBSchema, IDBPDatabase } from 'idb';
import type { Collection, DateObject, FoodTake, Item } from '~/types/entities';

export type FoodTakeKey = `${number}-${number}-${number}`;
export type StoredFoodTakeGroup = {
  key: FoodTakeKey;
  date: DateObject;
  takes: FoodTake[];
};

export interface Schema extends DBSchema {
  items: {
    key: string;
    value: Item;
  };
  'item-categories': {
    key: string;
    value: Collection;
  },
  'food-takes': {
    key: FoodTakeKey;
    value: StoredFoodTakeGroup;
  },
}

export const upgrade = (database: IDBPDatabase) => {
  const db = database as IDBPDatabase<Schema>;

  db.createObjectStore('food-takes', {
    keyPath: 'key',
  });
};
