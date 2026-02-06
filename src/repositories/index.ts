import { inject, type InjectionKey } from 'vue';
import { REPOSITORY_KEY_COLLECTION } from '~/types/repositories/collection';
import { REPOSITORY_KEY_CALCULATION_DAY } from '~/types/repositories/calculation-day';
import { REPOSITORY_KEY_ITEM } from '~/types/repositories/item';

const useRepository = <T>(key: InjectionKey<T>): T => {
  const repository = inject(key);
  if (repository == undefined) {
    throw new Error(`Missing repository ${key.description}`);
  }
  return repository;
};

export const useRepositoryItem = () => useRepository(REPOSITORY_KEY_ITEM);
export const useRepositoryCollection = () => useRepository(REPOSITORY_KEY_COLLECTION);
export const useRepositoryCalculationDay = () => useRepository(REPOSITORY_KEY_CALCULATION_DAY);
