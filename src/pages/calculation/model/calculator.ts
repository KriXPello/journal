export const CALCULATOR_OPERATIONS = ['+', '-', '/', '*'] as const;
export const CALCULATOR_ACTIONS = ['back', 'clear'] as const;

export type CalculatorOperation = typeof CALCULATOR_OPERATIONS[number];
export type CalculatorAction = typeof CALCULATOR_ACTIONS[number];

export type CalculatorInputValue =
  | '.'
  | CalculatorOperation
  | CalculatorAction
  | number;

export type CalculatorOperand = number;

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