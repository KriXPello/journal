import type { InjectionKey } from 'vue';
import type { DateObject, FoodTake, FoodTakeGroup } from '~/types/entities';

export type PayloadFoodTakeCreateOrUpdateGroup = {
  date: DateObject;
  takes: FoodTake[];
};

export type RepositoryFoodTake = {
  getGroupByDate: (date: DateObject) => Promise<FoodTakeGroup | undefined>;
  createOrUpdateGroup: (data: PayloadFoodTakeCreateOrUpdateGroup) => Promise<FoodTakeGroup>;
};

export const REPOSITORY_KEY_FOOD_TAKE = Symbol('repo-food-take') as InjectionKey<RepositoryFoodTake>;
