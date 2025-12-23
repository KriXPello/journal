import { computed, toValue, type MaybeRefOrGetter, type Ref } from 'vue';
import type { CollectionField, Item, Suggestion } from '~/types/entities';

const search = (inputValue: string, field: CollectionField, items: Item[]): Suggestion[] => {
  if (inputValue == undefined) {
    return [];
  }
  inputValue = String(inputValue).toLocaleUpperCase().trim();
  if (inputValue == '') {
    return [];
  }

  const usedValues = new Set<string>();
  const suggestions: Suggestion[] = [];

  for (const item of items) {
    const value = item.data[field.id];
    if (value == undefined) {
      continue;
    }
    const strValue = String(value).trim().toLocaleUpperCase();
    if (strValue == '' || usedValues.has(strValue)) {
      continue;
    }
    usedValues.add(strValue);
    if (strValue.includes(inputValue)) {
      suggestions.push({
        text: strValue,
        key: item.id,
      });
    }
  }

  return suggestions;
};

export const useItemSuggestions = (options: {
  fields: CollectionField[];
  items: MaybeRefOrGetter<Item[]>;
  data: Ref<Record<string, unknown>>;
}) => {
  const { fields, items: itemsRaw, data } = options;

  const suggestions = Object.fromEntries(
    fields.map(field => {
      const computedList = computed(() => {
        const inputValue = data.value[field.id];
        if (inputValue == undefined) {
          return [];
        }
        const searchValue = String(inputValue).trim().toLocaleUpperCase();
        if (searchValue == '') {
          return [];
        }
        const items = toValue(itemsRaw);
        return search(searchValue, field, items);
      });
      return [field.id, computedList];
    }),
  );

  return {
    suggestions,
  };
};