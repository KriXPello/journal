import type { DateObject, FoodTake } from '~/shared/types/calories';
import type { Collection, CollectionGroup, Item } from '~/shared/types/collections';

export type FoodTakeGroupBackupRecord = {
  key: string;
  date: DateObject;
  takes: FoodTake[];
};

export type AppDataBackupV1 = {
  version: 1;
  exportedAt: string;
  data: {
    collections: Collection[];
    items: Omit<Item, 'groupId'>[];
    foodTakeGroups: FoodTakeGroupBackupRecord[];
  };
};

export type AppDataBackupV2 = {
  version: 2;
  exportedAt: string;
  data: {
    collections: Collection[];
    items: Item[];
    foodTakeGroups: FoodTakeGroupBackupRecord[];
    groups: CollectionGroup[];
  };
};

export type AppDataBackup = AppDataBackupV1 | AppDataBackupV2;
