import { computed, toValue, type MaybeRefOrGetter, type Ref } from 'vue';
import type { CollectionField, Item } from '~/types/entities';

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
        if (inputValue == '' || inputValue == undefined) {
          return [];
        }
        const items = toValue(itemsRaw);
        return items.filter(item => {
          const itemValue = item.data[field.id];
          return itemValue != undefined && String(itemValue).includes(inputValue as string);
        });
      });
      return [field.id, computedList];
    }),
  );

  return {
    suggestions,
  };
};