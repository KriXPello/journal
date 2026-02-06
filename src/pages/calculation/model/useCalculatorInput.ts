import { ref } from 'vue';
import { CALCULATOR_OPERATIONS, isCalculatorOperation, type CalculatorInputValue } from './calculator';

const replaceLast = (text: string, replaceTo: string) => {
  return text.slice(0, -1) + replaceTo;
};

const endsWithAny = (text: string, list: readonly string[]) => list.some(x => text.endsWith(x));

const canInsertDot = (text: string, cursorIndex: number) => {
  const isNumChar = (ch: string | undefined) => !!ch && /[0-9.]/.test(ch);
  let left = cursorIndex;
  let right = cursorIndex;
  while (left > 0 && isNumChar(text[left - 1])) {
    left--;
  }
  while (right < text.length && isNumChar(text[right])) {
    right++;
  }
  const token = text.slice(left, right);
  if (token.includes('.')) {
    return false;
  }
  // значит либо в числе без точки, либо вообще не в числе
  return true;
};

const transformExpression = (
  currentExpression: string,
  pos: number,
  value: CalculatorInputValue,
): [expression: string, cursorPosition: number] => {
  const currentInput = currentExpression;
  const left = currentInput.slice(0, pos);
  const right = currentExpression.slice(pos);

  if (value == 'clear') {
    return ['', 0];
  } else if (value == 'back') {
    return [replaceLast(left, '') + right, Math.max(0, pos - 1)];
  } else if (isCalculatorOperation(value)) {
    if (endsWithAny(left, CALCULATOR_OPERATIONS)) {
      return [replaceLast(left, value) + right, pos];
    } else {
      return [left + value + right, pos + 1];
    }
  } else if (value == '.' && canInsertDot(currentExpression, pos)) {
    if (/[0-9]+$/.test(left)) { // добавляем точку в число/к числу
      return [left + '.' + right, pos + 1];
    } else { // начинаем число с точки
      return [left + '0.' + right, pos + 2];
    }
  } else if (typeof value == 'number') {
    const str = String(value);
    return [left + str + right, str.length];
  }
  return [currentExpression, pos];
};

export const useCalculatorInput = (params: {
  getCursorPosIndex: () => number;
  setCursorPosIndex: (index: number) => void;
}) => {
  const expression = ref('');

  const handleCalculatorInput = (value: CalculatorInputValue) => {
    const [
      newExpression,
      newCursorPos,
    ] = transformExpression(expression.value, params.getCursorPosIndex(), value);
    expression.value = newExpression;
    params.setCursorPosIndex(newCursorPos);
  };

  return {
    expression,
    handleCalculatorInput,
  };
};