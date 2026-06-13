import type { DBSchema, IDBPDatabase, IDBPTransaction, StoreNames } from 'idb';
import type { Collection, DateObject, FoodTake, Item } from '~/shared/types';

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
    indexes: {
      'by-collection-id': string;
    };
  };
  'item-categories': {
    key: string;
    value: Collection;
  };
  'food-takes': {
    key: FoodTakeKey;
    value: StoredFoodTakeGroup;
  };
}

export type DbType = IDBPDatabase<Schema>;
export type DbUpgradeTransactionType = IDBPTransaction<Schema, StoreNames<Schema>[], 'versionchange'>;

export const upgrade = (_: DbType, transaction: DbUpgradeTransactionType) => {
  const store = transaction.objectStore('items');

  store.createIndex('by-collection-id', 'collectionId');
};
