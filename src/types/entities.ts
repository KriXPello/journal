export type FoodTake = {
  id: string;
  energy: number;
  weight: number;
  dateISO: string;
  label: string;
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
