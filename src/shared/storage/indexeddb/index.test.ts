import { openDB } from 'idb';
import { describe, expect, it } from 'vitest';
import type { AppDataBackupV1, Collection, Item } from '~/shared/types';
import { createIndexedDbRepositories } from './index';
import type { Schema as SchemaV1 } from './versions/001';
import * as v001 from './versions/001';

const createBackup = (data: AppDataBackupV1['data']): AppDataBackupV1 => {
  return {
    version: 1,
    exportedAt: '2026-03-29T00:00:00.000Z',
    data,
  };
};

const getDatabaseName = (name: string) => {
  return `test-${name}-${crypto.randomUUID()}`;
};

describe('createIndexedDbRepositories', () => {
  it('exports the current app data as a versioned backup', async () => {
    const repositories = await createIndexedDbRepositories(getDatabaseName('export-backup'));

    const collection = await repositories.collection.create({
      label: 'Фильмы',
      fields: [
        {
          label: 'Название',
          kind: 'text',
          suggestValue: true,
        },
      ],
    });
    const titleField = collection.fields[0]!;

    await repositories.item.create({
      collectionId: collection.id,
      data: {
        [titleField.id]: 'Inception',
      },
    });

    await repositories.foodTake.createOrUpdateGroup({
      date: { year: 2026, month: 3, day: 29 },
      takes: [
        {
          id: 'take-1',
          energy: 250,
          weight: 120,
          label: 'Йогурт',
        },
      ],
    });

    const backup = await repositories.appData.exportBackup();
    const exportedCollection = backup.data.collections[0]!;
    const exportedItem = backup.data.items[0]!;
    const exportedFoodTakeGroup = backup.data.foodTakeGroups[0]!;

    expect(backup.version).toBe(1);
    expect(backup.data.collections).toHaveLength(1);
    expect(backup.data.items).toHaveLength(1);
    expect(backup.data.foodTakeGroups).toHaveLength(1);
    expect(exportedCollection.fields[0]!.suggestValue).toBe(true);
    expect(exportedItem.data[titleField.id]).toBe('Inception');
    expect(exportedFoodTakeGroup.key).toBe('2026-3-29');
  });

  it('imports backups by replacing records with the same primary key and appending new ones', async () => {
    const repositories = await createIndexedDbRepositories(getDatabaseName('import-backup'));

    const initialBackup = createBackup({
      collections: [
        {
          id: 'collection-1',
          label: 'Старые фильмы',
          orderNum: 1,
          fields: [
            {
              id: 'field-title',
              label: 'Название',
              kind: 'text',
              suggestValue: false,
            },
          ],
        },
      ],
      items: [
        {
          id: 'item-1',
          collectionId: 'collection-1',
          data: {
            'field-title': 'Old title',
          },
        },
      ],
      foodTakeGroups: [
        {
          key: '2026-3-29',
          date: { year: 2026, month: 3, day: 29 },
          takes: [
            {
              id: 'take-old',
              energy: 100,
              weight: 100,
              label: 'Старый прием',
            },
          ],
        },
      ],
    });

    await repositories.appData.importBackup(initialBackup);

    const incomingBackup = createBackup({
      collections: [
        {
          id: 'collection-1',
          label: 'Новые фильмы',
          orderNum: 5,
          fields: [
            {
              id: 'field-title',
              label: 'Название',
              kind: 'text',
              suggestValue: true,
            },
          ],
        },
        {
          id: 'collection-2',
          label: 'Книги',
          orderNum: 2,
          fields: [],
        },
      ],
      items: [
        {
          id: 'item-1',
          collectionId: 'collection-1',
          data: {
            'field-title': 'Updated title',
          },
        },
        {
          id: 'item-2',
          collectionId: 'collection-2',
          data: {},
        },
      ],
      foodTakeGroups: [
        {
          key: '2026-3-29',
          date: { year: 2026, month: 3, day: 29 },
          takes: [
            {
              id: 'take-new',
              energy: 400,
              weight: 150,
              label: 'Новый прием',
            },
          ],
        },
        {
          key: '2026-3-30',
          date: { year: 2026, month: 3, day: 30 },
          takes: [],
        },
      ],
    });

    const summary = await repositories.appData.importBackup(incomingBackup);
    const exported = await repositories.appData.exportBackup();

    expect(summary).toEqual({
      collections: 2,
      items: 2,
      foodTakeGroups: 2,
    });
    expect(exported.data.collections).toHaveLength(2);
    expect(exported.data.items).toHaveLength(2);
    expect(exported.data.foodTakeGroups).toHaveLength(2);
    expect(exported.data.collections.find(item => item.id === 'collection-1')?.label).toBe('Новые фильмы');
    expect(exported.data.items.find(item => item.id === 'item-1')?.data['field-title']).toBe('Updated title');
    expect(exported.data.foodTakeGroups.find(item => item.key === '2026-3-29')?.takes[0]?.id).toBe('take-new');
  });

  it('clears all stores', async () => {
    const repositories = await createIndexedDbRepositories(getDatabaseName('clear-all'));

    await repositories.appData.importBackup(createBackup({
      collections: [
        {
          id: 'collection-1',
          label: 'Фильмы',
          orderNum: 1,
          fields: [],
        },
      ],
      items: [
        {
          id: 'item-1',
          collectionId: 'collection-1',
          data: {},
        },
      ],
      foodTakeGroups: [
        {
          key: '2026-3-29',
          date: { year: 2026, month: 3, day: 29 },
          takes: [],
        },
      ],
    }));

    await repositories.appData.clearAll();
    const exported = await repositories.appData.exportBackup();

    expect(exported.data.collections).toEqual([]);
    expect(exported.data.items).toEqual([]);
    expect(exported.data.foodTakeGroups).toEqual([]);
  });

  it('migrates databases created with version 1', async () => {
    const dbName = getDatabaseName('migration-v1');
    const db = await openDB<SchemaV1>(dbName, 1, {
      upgrade(database, oldVersion) {
        if (oldVersion < 1) {
          v001.upgrade(database as any);
        }
      },
    });

    const collection: Collection = {
      id: 'collection-1',
      label: 'Фильмы',
      orderNum: 1,
      fields: [],
    };
    const item: Item = {
      id: 'item-1',
      collectionId: 'collection-1',
      data: {},
    };

    await db.put('item-categories', collection);
    await db.put('items', item);
    db.close();

    const repositories = await createIndexedDbRepositories(dbName);
    const backup = await repositories.appData.exportBackup();

    expect(backup.data.collections).toEqual([collection]);
    expect(backup.data.items).toEqual([item]);
    expect(backup.data.foodTakeGroups).toEqual([]);

    await repositories.foodTake.createOrUpdateGroup({
      date: { year: 2026, month: 4, day: 1 },
      takes: [],
    });

    const withFoodTakes = await repositories.appData.exportBackup();
    expect(withFoodTakes.data.foodTakeGroups).toHaveLength(1);
  });
});
