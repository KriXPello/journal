import type { DBSchema, IDBPDatabase, IDBPTransaction, StoreNames } from 'idb';
import type { Collection, CollectionGroup, Item } from '~/shared/types';
import type { FoodTakeKey, StoredFoodTakeGroup } from './003';

export interface Schema extends DBSchema {
  items: { key: string; value: Item; indexes: { 'by-collection-id': string } };
  'item-categories': { key: string; value: Collection };
  'food-takes': { key: FoodTakeKey; value: StoredFoodTakeGroup };
  'collection-groups': { key: string; value: CollectionGroup; indexes: { 'by-collection-id': string } };
}
export type DbType = IDBPDatabase<Schema>;
export type DbUpgradeTransactionType = IDBPTransaction<Schema, StoreNames<Schema>[], 'versionchange'>;

export const upgrade = async (db: DbType, transaction: DbUpgradeTransactionType) => {
  const groups = db.createObjectStore('collection-groups', { keyPath: 'id' });
  groups.createIndex('by-collection-id', 'collectionId');
  for await (const cursor of transaction.objectStore('items')) {
    await cursor.update({ ...cursor.value, groupId: null });
  }
};
