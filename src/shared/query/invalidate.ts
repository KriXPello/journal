import { useQueryCache } from '@pinia/colada';
import { COLLECTION_QUERY_KEYS } from '~/shared/query/collection';
import { FOOD_TAKE_QUERY_KEYS } from '~/shared/query/food-take';
import { ITEM_QUERY_KEYS } from '~/shared/query/item';

export const invalidateAllAppData = () => {
  const queryCache = useQueryCache();
  queryCache.invalidateQueries({ key: COLLECTION_QUERY_KEYS.root });
  queryCache.invalidateQueries({ key: ITEM_QUERY_KEYS.root });
  queryCache.invalidateQueries({ key: FOOD_TAKE_QUERY_KEYS.root });
};
