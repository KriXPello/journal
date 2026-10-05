import { openDB, type IDBPDatabase, type IDBPTransaction, type StoreNames } from 'idb';
import { getRandomId } from '~/shared/lib/system';
import type {
  AppDataBackup,
  AppDataBackupV2,
  CollectionGroup,
  Collection,
  DateObject,
  FoodTakeGroupBackupRecord,
  Item,
} from '~/shared/types';
import type {
  PayloadCollectionCreate,
  PayloadCollectionUpdate,
  RepositoryAppData,
  RepositoryCollection,
  RepositoryFoodTake,
  ItemRepository,
  ItemBatchPayload,
  GroupRepository,
} from '~/shared/storage/contracts';
import * as v001 from './versions/001';
import * as v002 from './versions/002';
import type { FoodTakeKey, StoredFoodTakeGroup } from './versions/003';
import * as v003 from './versions/003';
import * as v004 from './versions/004';

const BACKUP_VERSION = 2;

export const createIndexedDbRepositories = async (dbName = 'app-db') => {
  const db = await openDB<v004.Schema>(dbName, 4, {
    upgrade: (database, oldVersion, _newVersion, transaction) => {
      if (oldVersion < 1) {
        v001.upgrade(database as IDBPDatabase<unknown>);
      }
      if (oldVersion < 2) {
        v002.upgrade(database as IDBPDatabase<unknown>);
      }
      if (oldVersion < 3) {
        v003.upgrade(database as unknown as v003.DbType, transaction as unknown as v003.DbUpgradeTransactionType);
      }
      if (oldVersion < 4) {
        void transaction.done.catch(() => {});
        void v004.upgrade(database, transaction).catch(() => {
          try {
            transaction.abort();
          } catch {
            // A failed migration request may have already aborted the upgrade.
          }
        });
      }
    },
  });

  // IndexedDB does not abort a transaction when application-level validation throws.
  const writeTransaction = async <Stores extends StoreNames<v004.Schema>[], Result>(
    stores: Stores,
    operation: (tx: IDBPTransaction<v004.Schema, Stores, 'readwrite'>) => Promise<Result>,
  ): Promise<Result> => {
    const tx = db.transaction(stores, 'readwrite');
    void tx.done.catch(() => {});
    try {
      const result = await operation(tx);
      await tx.done;
      return result;
    } catch (error) {
      try {
        tx.abort();
      } catch {
        // A failed request may have already aborted the transaction.
      }
      await tx.done.catch(() => {});
      throw error;
    }
  };

  const groupLabel = (label: string) => {
    const result = label.trim();
    if (!result) throw new Error('Укажите название группы');
    return result;
  };

  const readBatchItems = async (
    getItem: (id: string) => Promise<Item | undefined>,
    payload: ItemBatchPayload,
  ) => {
    const records: Item[] = [];
    for (const id of new Set(payload.ids)) {
      const record = await getItem(id);
      if (!record || record.collectionId !== payload.collectionId) {
        throw new Error('Выбранная запись не найдена в этой коллекции');
      }
      records.push(record);
    }
    return records;
  };

  const item: ItemRepository = {
    getCollectionItems: async (payload) => {
      const items = await db.getAllFromIndex('items', 'by-collection-id', payload.collectionId);
      return items;
    },
    getOne: async (id) => {
      const record = await db.get('items', id);
      return record;
    },
    create: payload => writeTransaction(['items', 'item-categories', 'collection-groups'], async (tx) => {
      if (!await tx.objectStore('item-categories').get(payload.collectionId)) {
        throw new Error('Коллекция не найдена');
      }
      if (payload.groupId !== null) {
        const target = await tx.objectStore('collection-groups').get(payload.groupId);
        if (!target || target.collectionId !== payload.collectionId) {
          throw new Error('Группа не принадлежит этой коллекции');
        }
      }
      const record: Item = {
        id: getRandomId(),
        collectionId: payload.collectionId,
        data: { ...payload.data },
        groupId: payload.groupId,
      };
      await tx.objectStore('items').add(record);
      return record;
    }),
    update: payload => writeTransaction(['items'], async (tx) => {
      const store = tx.objectStore('items');
      const oldRecord = await store.get(payload.id);
      if (!oldRecord) throw new Error('Запись не найдена');
      const record: Item = {
        id: payload.id,
        collectionId: oldRecord.collectionId,
        data: { ...payload.data },
        groupId: oldRecord.groupId,
      };
      await store.put(record);
      return record;
    }),
    remove: async (id) => {
      await db.delete('items', id);
    },
    move: ({ id, groupId }) => writeTransaction(['items', 'collection-groups'], async (tx) => {
      const item = await tx.objectStore('items').get(id);
      if (!item) throw new Error('Запись не найдена');
      if (groupId !== null) {
        const group = await tx.objectStore('collection-groups').get(groupId);
        if (!group || group.collectionId !== item.collectionId) throw new Error('Группа не принадлежит этой коллекции');
      }
      const moved = { ...item, groupId };
      await tx.objectStore('items').put(moved);
      return moved;
    }),
    removeMany: payload => writeTransaction(['items'], async (tx) => {
      if (payload.ids.length === 0) return;
      const store = tx.objectStore('items');
      const records = await readBatchItems(id => store.get(id), payload);
      await Promise.all(records.map(record => store.delete(record.id)));
    }),
    moveMany: payload => writeTransaction(['items', 'collection-groups'], async (tx) => {
      if (payload.ids.length === 0) return;
      const itemStore = tx.objectStore('items');
      const records = await readBatchItems(id => itemStore.get(id), payload);
      if (payload.groupId !== null) {
        const group = await tx.objectStore('collection-groups').get(payload.groupId);
        if (!group || group.collectionId !== payload.collectionId) {
          throw new Error('Группа не принадлежит этой коллекции');
        }
      }
      await Promise.all(records.map(record => itemStore.put({ ...record, groupId: payload.groupId })));
    }),
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
        fields: payload.fields.map((f) => ({
          id: getRandomId(),
          label: f.label,
          kind: f.kind,
          suggestValue: f.suggestValue,
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
        fields: payload.fields.map((f) => ({
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
    remove: id => writeTransaction(['item-categories', 'items', 'collection-groups'], async (tx) => {
      const items = await tx.objectStore('items').index('by-collection-id').getAllKeys(id);
      const groups = await tx.objectStore('collection-groups').index('by-collection-id').getAllKeys(id);
      await Promise.all([
        ...items.map(key => tx.objectStore('items').delete(key)),
        ...groups.map(key => tx.objectStore('collection-groups').delete(key)),
        tx.objectStore('item-categories').delete(id),
      ]);
    }),
  };

  const group: GroupRepository = {
    getCollectionGroups: ({ collectionId }) => db.getAllFromIndex('collection-groups', 'by-collection-id', collectionId),
    create: ({ collectionId, parentId, label }) => writeTransaction(['item-categories', 'collection-groups'], async (tx) => {
      const cleanLabel = groupLabel(label);
      if (!await tx.objectStore('item-categories').get(collectionId)) throw new Error('Коллекция не найдена');
      if (parentId !== null) {
        const parent = await tx.objectStore('collection-groups').get(parentId);
        if (!parent || parent.collectionId !== collectionId) throw new Error('Родительская группа не принадлежит этой коллекции');
      }
      const record = { id: getRandomId(), collectionId, parentId, label: cleanLabel };
      await tx.objectStore('collection-groups').add(record);
      return record;
    }),
    update: ({ id, label }) => writeTransaction(['collection-groups'], async (tx) => {
      const cleanLabel = groupLabel(label);
      const store = tx.objectStore('collection-groups');
      const old = await store.get(id);
      if (!old) throw new Error('Группа не найдена');
      const record = { ...old, label: cleanLabel };
      await store.put(record);
      return record;
    }),
    move: ({ id, parentId }) => writeTransaction(['collection-groups'], async (tx) => {
      const store = tx.objectStore('collection-groups');
      const old = await store.get(id);
      if (!old) throw new Error('Группа не найдена');
      if (parentId !== null) {
        let parent = await store.get(parentId);
        if (!parent || parent.collectionId !== old.collectionId) throw new Error('Родительская группа не принадлежит этой коллекции');
        while (parent) {
          if (parent.id === id) throw new Error('Нельзя переместить группу в себя или её подгруппу');
          if (parent.parentId === null) break;
          parent = await store.get(parent.parentId);
        }
      }
      const record = { ...old, parentId };
      await store.put(record);
      return record;
    }),
    remove: id => writeTransaction(['collection-groups', 'items'], async (tx) => {
      const store = tx.objectStore('collection-groups');
      const removed = await store.get(id);
      if (!removed) return;
      const children = await store.index('by-collection-id').getAll(removed.collectionId);
      for (const child of children) {
        if (child.parentId === id) await store.put({ ...child, parentId: removed.parentId });
      }
      const items = await tx.objectStore('items').index('by-collection-id').getAll(removed.collectionId);
      for (const item of items) {
        if (item.groupId === id) await tx.objectStore('items').put({ ...item, groupId: removed.parentId });
      }
      await store.delete(id);
    }),
  };

  const createFoodTakeKey = (date: DateObject): FoodTakeKey => {
    return `${date.year}-${date.month}-${date.day}`;
  };
  const foodTake: RepositoryFoodTake = {
    getGroupByDate: async (date) => {
      const key = createFoodTakeKey(date);
      const result = await db.get('food-takes', key);
      if (result == undefined) {
        return undefined;
      }
      return {
        date: result.date,
        takes: result.takes,
      };
    },
    createOrUpdateGroup: async (payload) => {
      const key = createFoodTakeKey(payload.date);
      const record: StoredFoodTakeGroup = {
        key: key,
        date: payload.date,
        takes: payload.takes,
      };
      await db.put('food-takes', record);
      return record;
    },
  };

  const appData: RepositoryAppData = {
    exportBackup: async () => {
      const tx = db.transaction(['item-categories', 'items', 'food-takes', 'collection-groups'], 'readonly');
      const [collections, items, foodTakeGroups, groups] = await Promise.all([
        tx.objectStore('item-categories').getAll(),
        tx.objectStore('items').getAll(),
        tx.objectStore('food-takes').getAll(),
        tx.objectStore('collection-groups').getAll(),
      ]);
      await tx.done;

      const backup: AppDataBackupV2 = {
        version: BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        data: {
          collections,
          items,
          foodTakeGroups,
          groups,
        },
      };

      return backup;
    },
    importBackup: (backup: AppDataBackup) => writeTransaction(['item-categories', 'items', 'food-takes', 'collection-groups'], async (tx) => {
      if (backup.version !== 1 && backup.version !== 2) {
        throw new Error('Неподдерживаемая версия бэкапа');
      }

      const collectionStore = tx.objectStore('item-categories');
      const itemStore = tx.objectStore('items');
      const foodTakeStore = tx.objectStore('food-takes');
      const groupStore = tx.objectStore('collection-groups');

      for (const collection of backup.data.collections) {
        await collectionStore.put(collection);
      }

      let incomingGroups: CollectionGroup[] = [];
      if (backup.version === 2) {
        incomingGroups = backup.data.groups;
        for (const group of incomingGroups) await groupStore.put(group);
        for (const item of backup.data.items) await itemStore.put(item);
      } else {
        for (const item of backup.data.items) await itemStore.put({ ...item, groupId: null });
      }

      for (const group of backup.data.foodTakeGroups) {
        const record: FoodTakeGroupBackupRecord = group;
        const key = (record.key || createFoodTakeKey(record.date)) as FoodTakeKey;
        await foodTakeStore.put({
          key,
          date: record.date,
          takes: record.takes,
        });
      }

      const mergedGroups = await groupStore.getAll();
      const mergedItems = await itemStore.getAll();
      const mergedCollections = await collectionStore.getAll();
      const groupMap = new Map(mergedGroups.map(value => [value.id, value]));
      const collectionIds = new Set(mergedCollections.map(value => value.id));
      for (const group of mergedGroups) {
        if (typeof group.id !== 'string' || !group.id || typeof group.label !== 'string' || !group.label.trim()
          || !collectionIds.has(group.collectionId)
          || (group.parentId !== null && groupMap.get(group.parentId)?.collectionId !== group.collectionId)) {
          throw new Error('Некорректная иерархия групп в бэкапе');
        }
      }
      const checkedIds = new Set<string>();
      for (const group of mergedGroups) {
        const visited = new Set<string>();
        let currentId: string | null = group.id;
        while (currentId !== null && !checkedIds.has(currentId)) {
          if (visited.has(currentId)) throw new Error('Цикл в иерархии групп в бэкапе');
          visited.add(currentId);
          currentId = groupMap.get(currentId)!.parentId;
        }
        for (const id of visited) checkedIds.add(id);
      }
      for (const item of mergedItems) {
        if (item.groupId !== null) {
          const group = groupMap.get(item.groupId);
          if (typeof item.groupId !== 'string' || !group || group.collectionId !== item.collectionId) {
            throw new Error('Некорректная группа записи в бэкапе');
          }
        }
      }

      return {
        collections: backup.data.collections.length,
        items: backup.data.items.length,
        foodTakeGroups: backup.data.foodTakeGroups.length,
        groups: incomingGroups.length,
      };
    }),
    clearAll: async () => {
      const tx = db.transaction(['item-categories', 'items', 'food-takes', 'collection-groups'], 'readwrite');
      await Promise.all([
        tx.objectStore('item-categories').clear(),
        tx.objectStore('items').clear(),
        tx.objectStore('food-takes').clear(),
        tx.objectStore('collection-groups').clear(),
      ]);
      await tx.done;
    },
  };

  return {
    appData,
    item,
    group,
    collection,
    foodTake,
  };
};
