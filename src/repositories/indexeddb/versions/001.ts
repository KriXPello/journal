import type { DBSchema, IDBPDatabase } from 'idb';
import type { Item, Collection } from '~/types/entities';

export interface Schema extends DBSchema {
  items: {
    key: string;
    value: Item;
  };
  'item-categories': {
    key: string;
    value: Collection;
  },
}

export const upgrade = (database: IDBPDatabase) => {
  const db = database as IDBPDatabase<Schema>;

  db.createObjectStore('items', {
    keyPath: 'id',
  });
  db.createObjectStore('item-categories', {
    keyPath: 'id',
  });
};
