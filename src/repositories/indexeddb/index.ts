import { openDB, type IDBPDatabase } from 'idb';
import type { Collection, Item } from '~/types/entities';
import type { PayloadCollectionCreate, PayloadCollectionUpdate, RepositoryCollection } from '~/types/repositories/collection';
import type { RepositoryItem } from '~/types/repositories/item';
import { getRandomId } from '~/utils/getRandomId';
import * as v001 from './versions/001';

export const createIndexedDbRepositories = async () => {
  const db = await openDB<v001.Schema>('app-db', 1, {
    upgrade: (database, oldVersion) => {
      if (oldVersion < 1) {
        v001.upgrade(database as IDBPDatabase<unknown>);
      }
    },
  });

  const item: RepositoryItem = {
    getAll: async () => {
      const result = await db.getAll('items');
      return result;
    },
    getOne: async (id) => {
      const record = await db.get('items', id);
      return record;
    },
    create: async (payload) => {
      const record: Item = {
        id: getRandomId(),
        collectionId: payload.collectionId,
        data: { ...payload.data },
      };
      await db.add('items', record);
      return record;
    },
    update: async (payload) => {
      const tx = db.transaction('items', 'readwrite');
      const store = tx.objectStore('items');
      const oldRecord = await store.get(payload.id);
      const record: Item = {
        id: payload.id,
        collectionId: oldRecord!.collectionId,
        data: { ...payload.data },
      };
      await store.put(record);
      await tx.done;
      return record;
    },
  };

  const collection: RepositoryCollection = {
    getAll: async () => {
      const result = await db.getAll('item-categories');
      return result;
    },
    getOne: async (id) => {
      const record = await db.get('item-categories', id);
      return record;
    },
    create: async (payload: PayloadCollectionCreate) => {
      const tx = db.transaction('item-categories', 'readwrite');
      const store = tx.objectStore('item-categories');
      let max = 0;
      for await (const cursor of store) {
        const n = cursor.value.orderNum ?? 0;
        if (n > max) max = n;
      }
      const record: Collection = {
        id: getRandomId(),
        label: payload.label,
        orderNum: max + 1,
        fields: payload.fields.map(f => ({
          id: getRandomId(),
          label: f.label,
          kind: f.kind,
        })),
      };
      await store.add(record);
      await tx.done;
      return record;
    },
    update: async (payload: PayloadCollectionUpdate) => {
      const tx = db.transaction('item-categories', 'readwrite');
      const store = tx.objectStore('item-categories');
      const oldRecord = await store.get(payload.id);
      const record: Collection = {
        id: payload.id,
        label: payload.label,
        orderNum: oldRecord!.orderNum,
        fields: payload.fields.map(f => ({
          id: f.id,
          label: f.label,
          kind: f.kind,
        })),
      };
      await store.put(record);
      await tx.done;
    },
  };

  return {
    item,
    collection,
  };
};
