import { computed, ref, toValue, watch, type ComputedRef, type MaybeRefOrGetter, type Ref } from 'vue';
import { searchFieldSuggestions } from '~/shared/lib/search';
import type { CollectionField, Item, Suggestion } from '~/shared/types';

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
            const items = toValue(itemsRaw);
            return searchFieldSuggestions(items, field.id, String(inputValue));
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
