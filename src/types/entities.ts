export type DateObject = {
  year: number;
  /** 1-12 */
  month: number;
  day: number;
};

export namespace DateObject {
  export const fromDate = (date: Date): DateObject => {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  };
  export const isEqual = (a: DateObject, b: DateObject): boolean => {
    return a.year === b.year && a.month === b.month && a.day === b.day;
  };
}

export type Calculation = {
  id: string;
  /** редактируемое выражение для расчета */
  expression: string;
  /** Вычисленный результат */
  result: number;
};

export type CalculationDay = {
  date: DateObject;
  calculations: Calculation[];
};

export type FoodTake = {
  id: string;
  energy: number;
  weight: number;
  label: string;
};

export type FoodTakeGroup = {
  date: DateObject;
  takes: FoodTake[];
};

export const COLLECTION_FIELD_KINDS = [
  'text',
  'textarea',
  'number',
  'date',
] as const;
export type CollectionFieldKind = typeof COLLECTION_FIELD_KINDS[number];
export const COLLECTION_FIELD_KIND_NAMES: Record<CollectionFieldKind, string> = {
  'text': 'Текст',
  'textarea': 'Текст (большой)',
  'number': 'Число',
  'date': 'Дата',
};


export type CollectionField = {
  id: string;
  label: string;
  kind: CollectionFieldKind;
  suggestValue?: boolean;
};

export type Collection = {
  id: string;
  label: string;
  orderNum: number;
  fields: CollectionField[];
};

export type Item = {
  id: string;
  collectionId: string;
  data: Record<CollectionField['id'], unknown>;
};

export type Suggestion = {
  text: string;
  key: string;
};
