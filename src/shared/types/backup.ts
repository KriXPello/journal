import type { DateObject, FoodTake } from '~/shared/types/calories';
import type { Collection, Item } from '~/shared/types/collections';

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
    items: Item[];
    foodTakeGroups: FoodTakeGroupBackupRecord[];
  };
};

export type AppDataBackup = AppDataBackupV1;
