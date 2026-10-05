import { useQueryCache } from '@pinia/colada';
import { COLLECTION_QUERY_KEYS, FOOD_TAKE_QUERY_KEYS, ITEM_QUERY_KEYS, GROUP_QUERY_KEYS } from './keys';

export const invalidateAllAppData = () => {
  const queryCache = useQueryCache();
  queryCache.invalidateQueries({ key: COLLECTION_QUERY_KEYS.root });
  queryCache.invalidateQueries({ key: ITEM_QUERY_KEYS.root });
  queryCache.invalidateQueries({ key: FOOD_TAKE_QUERY_KEYS.root });
  queryCache.invalidateQueries({ key: GROUP_QUERY_KEYS.root });
};
