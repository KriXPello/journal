import { computed, ref, toValue, watch, type ComputedRef, type MaybeRefOrGetter, type Ref } from 'vue';
import type { CollectionField, Item, Suggestion } from '~/shared/types';

const search = (inputValue: string, field: CollectionField, items: Item[]): Suggestion[] => {
  if (inputValue == undefined) {
    return [];
  }
  const searchValueUpper = String(inputValue).toLocaleUpperCase().trim();
  if (searchValueUpper == '') {
    return [];
  }

  const usedValues = new Set<string>();
  const suggestions: Suggestion[] = [];

  for (const item of items) {
    const value = item.data[field.id];
    if (value == undefined) {
      continue;
    }
    const itemValueStr = String(value).trim();
    if (itemValueStr == '' || usedValues.has(itemValueStr)) {
      continue;
    }
    usedValues.add(itemValueStr);
    const itemValueStrUpper = itemValueStr.toLocaleUpperCase();
    if (itemValueStrUpper.includes(searchValueUpper)) {
      suggestions.push({
        text: itemValueStr,
        key: item.id,
      });
    }
  }

  return suggestions;
};

export const useItemSuggestions = (options: {
  fields: MaybeRefOrGetter<CollectionField[]>;
  items: MaybeRefOrGetter<Item[]>;
  data: Ref<Record<string, unknown>>;
}) => {
  const { fields: fieldsRaw, items: itemsRaw, data } = options;

  const suggestions = ref<Record<string, ComputedRef<Suggestion[]>>>({});

  watch(
    () => toValue(fieldsRaw),
    (fields) => {
      suggestions.value = Object.fromEntries(
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
    },
    { immediate: true },
  );

  return {
    suggestions,
  };
};
