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
}

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

export const CALCULATOR_OPERATIONS = ['+', '-', '/', '*'] as const;
export const CALCULATOR_ACTIONS = ['back', 'clear'] as const;

export type CalculatorOperation = typeof CALCULATOR_OPERATIONS[number];
export type CalculatorAction = typeof CALCULATOR_ACTIONS[number];

export type CalculatorInputValue =
  | '.'
  | CalculatorOperation
  | CalculatorAction
  | CalculatorOperand;

export type CalculatorOperand =
  | `${number}`
  | `${number}.`
  | `{number}.${number}`;
export type CalculatorExpression = Array<CalculatorOperation | CalculatorOperand>;

export const isCalculatorOperation = (value: unknown): value is CalculatorOperation => {
  return CALCULATOR_OPERATIONS.some(x => x === value);
};

export const isCalculatorAction = (value: unknown): value is CalculatorAction => {
  return CALCULATOR_ACTIONS.some(x => x === value);
};

export const isCalculatorOperand = (value: unknown): value is CalculatorOperand => {
  if (typeof value != 'string') return false;
  return /^\d+(\.\d*)?$/.test(value);
};