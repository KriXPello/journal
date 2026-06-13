import { defineMutationOptions, defineQueryOptions, useQueryCache } from '@pinia/colada';
import type { DateObject, FoodTake } from '~/shared/types';
import type { PayloadFoodTakeCreateOrUpdateGroup } from '~/shared/storage/contracts';
import { getRepositories } from '~/shared/storage/instance';

export const foodTakeDateKey = (date: DateObject) =>
  `${date.year}-${date.month}-${date.day}`;

export const FOOD_TAKE_QUERY_KEYS = {
  root: ['food-takes'] as const,
  byDate: (date: DateObject) =>
    [...FOOD_TAKE_QUERY_KEYS.root, foodTakeDateKey(date)] as const,
};

export const foodTakeGroupByDateQuery = defineQueryOptions(
  ({ date }: { date: DateObject }) => ({
    key: FOOD_TAKE_QUERY_KEYS.byDate(date),
    query: async () => {
      const group = await getRepositories().foodTake.getGroupByDate(date);
      return group?.takes ?? [];
    },
  }),
);

export const upsertFoodTakeGroupMutation = defineMutationOptions({
  mutation: (payload: PayloadFoodTakeCreateOrUpdateGroup) =>
    getRepositories().foodTake.createOrUpdateGroup(payload),
  onSuccess: (group) => {
    useQueryCache().invalidateQueries({ key: FOOD_TAKE_QUERY_KEYS.byDate(group.date) });
  },
});

export type FoodTakeGroupSavePayload = {
  date: DateObject;
  takes: FoodTake[];
};
