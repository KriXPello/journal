import { refDebounced } from '@vueuse/core';
import { computed, toValue, type MaybeRefOrGetter, type Ref } from 'vue';
import { SEARCH_DEBOUNCE_MS, searchFieldSuggestions } from '~/shared/lib/search';
import type { CollectionField, Item, Suggestion } from '~/shared/types';

export const useItemSuggestions = (options: {
  fields: MaybeRefOrGetter<CollectionField[]>;
  items: MaybeRefOrGetter<Item[]>;
  data: Ref<Record<string, unknown>>;
}) => {
  const { fields: fieldsRaw, items: itemsRaw, data } = options;

  const debouncedQueries = computed(() => {
    const fields = toValue(fieldsRaw).filter(field => field.suggestValue);
    const queries: Record<string, string> = {};

    for (const field of fields) {
      const inputValue = data.value[field.id];
      queries[field.id] = inputValue == undefined ? '' : String(inputValue);
    }

    return queries;
  });

  const debouncedQueriesByField = refDebounced(debouncedQueries, SEARCH_DEBOUNCE_MS);

  const suggestionLists = computed(() => {
    const items = toValue(itemsRaw);
    const queries = debouncedQueriesByField.value;
    const lists: Record<string, Suggestion[]> = {};

    for (const field of toValue(fieldsRaw)) {
      if (!field.suggestValue) {
        continue;
      }

      lists[field.id] = searchFieldSuggestions(items, field.id, queries[field.id] ?? '');
    }

    return lists;
  });

  return {
    suggestionLists,
  };
};
