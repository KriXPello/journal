import { computed, shallowRef } from 'vue';
import { type Item, type Collection } from '~/types/entities';

const items = shallowRef<Item[]>([]);
const collections = shallowRef<Collection[]>([]);

export const useDataStore = () => {
  const setCollections = (value: Collection[]) => {
    collections.value = value;
  };

  const setItems = (value: Item[]) => {
    items.value = value;
  };

  return {
    items: computed(() => items.value),
    setItems,
    collections: computed(() => collections.value),
    setCollections,
  };
};
