import { defineMutationOptions, defineQueryOptions, useQueryCache } from '@pinia/colada';
import type { DateObject, FoodTake } from '~/shared/types';
import type { PayloadFoodTakeCreateOrUpdateGroup } from '~/shared/storage/contracts';
import { getRepositories } from '~/shared/storage/instance';
import { FOOD_TAKE_QUERY_KEYS } from './keys';

export { FOOD_TAKE_QUERY_KEYS, foodTakeDateKey } from './keys';

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
