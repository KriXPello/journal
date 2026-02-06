import type { DBSchema, IDBPDatabase } from 'idb';
import type { Calculation, Collection, DateObject, Item } from '~/types/entities';

export type CalculationDayKey = `${number}-${number}-${number}`;
export type StoredCalculationDay = {
  key: CalculationDayKey;
  date: DateObject;
  calculations: Calculation[];
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
  'calculation-days': {
    key: CalculationDayKey;
    value: StoredCalculationDay;
  },
}

export const upgrade = (database: IDBPDatabase) => {
  database.deleteObjectStore('food-takes');

  const db = database as IDBPDatabase<Schema>;

  db.createObjectStore('calculation-days', {
    keyPath: 'key',
  });
};
