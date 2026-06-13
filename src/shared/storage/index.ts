import { inject, type InjectionKey } from 'vue';
import { REPOSITORY_KEY_APP_DATA, REPOSITORY_KEY_COLLECTION, REPOSITORY_KEY_FOOD_TAKE, ITEM_REPOSITORY_KEY } from '~/shared/storage/contracts';

const useRepository = <T>(key: InjectionKey<T>): T => {
  const repository = inject(key);
  if (repository == undefined) {
    throw new Error(`Missing repository ${key.description}`);
  }
  return repository;
};

export const useRepositoryAppData = () => useRepository(REPOSITORY_KEY_APP_DATA);
export const useRepositoryItem = () => useRepository(ITEM_REPOSITORY_KEY);
export const useRepositoryCollection = () => useRepository(REPOSITORY_KEY_COLLECTION);
export const useRepositoryFoodTake = () => useRepository(REPOSITORY_KEY_FOOD_TAKE);

export * from './contracts';
export * from './indexeddb';
