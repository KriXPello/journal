import { openDB, type IDBPDatabase } from 'idb';
import type { Collection, DateObject, Item } from '~/types/entities';
import type { PayloadCollectionCreate, PayloadCollectionUpdate, RepositoryCollection } from '~/types/repositories/collection';
import type { RepositoryCalculationDay } from '~/types/repositories/calculation-day';
import type { RepositoryItem } from '~/types/repositories/item';
import { getRandomId } from '~/utils/getRandomId';
import * as v001 from './versions/001';
import * as v002 from './versions/002';
import type { CalculationDayKey, StoredCalculationDay } from './versions/003';
import * as v003 from './versions/003';

export const createIndexedDbRepositories = async () => {
  const db = await openDB<v003.Schema>('app-db', 2, {
    upgrade: (database, oldVersion) => {
      if (oldVersion < 1) {
        v001.upgrade(database as IDBPDatabase<unknown>);
      }
      if (oldVersion < 2) {
        v002.upgrade(database as IDBPDatabase<unknown>);
      }
      if (oldVersion < 3) {
        v003.upgrade(database as IDBPDatabase<unknown>);
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
    remove: async (id) => {
      await db.delete('items', id);
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
          suggestValue: f.suggestValue,
        })),
      };
      await store.put(record);
      await tx.done;
      return record;
    },
    remove: async (id) => {
      await db.delete('item-categories', id);
      // TODO: delete all items of collection
    },
  };

  const createCalculationDayKey = (date: DateObject): CalculationDayKey => {
    return `${date.year}-${date.month}-${date.day}`;
  };
  const foodTake: RepositoryCalculationDay = {
    getByDate: async (date) => {
      const key = createCalculationDayKey(date);
      const result = await db.get('calculation-days', key);
      if (result == undefined) {
        return undefined;
      }
      return {
        date: result.date,
        calculations: result.calculations,
      };
    },
    createOrUpdate: async (payload) => {
      const key = createCalculationDayKey(payload.date);
      const record: StoredCalculationDay = {
        key: key,
        date: payload.date,
        calculations: payload.calculations,
      };
      await db.put('calculation-days', record);
      return record;
    },
  };

  return {
    item,
    collection,
    foodTake,
  };
};
