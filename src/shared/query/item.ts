import { defineMutationOptions, defineQueryOptions, useQueryCache } from '@pinia/colada';
import type {
  CreateItemPayload,
  UpdateItemPayload,
  ItemBatchPayload,
  ItemRepository,
} from '~/shared/storage/contracts';
import { getRepositories } from '~/shared/storage/instance';
import { ITEM_QUERY_KEYS } from './keys';

export { ITEM_QUERY_KEYS } from './keys';

export const collectionItemsQuery = defineQueryOptions(
  ({ collectionId }: { collectionId: string }) => ({
    key: ITEM_QUERY_KEYS.byCollection(collectionId),
    query: () => getRepositories().item.getCollectionItems({ collectionId }),
  }),
);

export const itemByIdQuery = defineQueryOptions(
  ({ id }: { id: string }) => ({
    key: ITEM_QUERY_KEYS.byId(id),
    query: async () => {
      const item = await getRepositories().item.getOne(id);
      if (!item) {
        throw new Error(`Item not found: ${id}`);
      }
      return item;
    },
  }),
);

export const createItemMutation = defineMutationOptions({
  mutation: (payload: CreateItemPayload) =>
    getRepositories().item.create(payload),
  onSuccess: (item) => {
    const queryCache = useQueryCache();
    queryCache.invalidateQueries({ key: ITEM_QUERY_KEYS.byCollection(item.collectionId) });
  },
});

export const updateItemMutation = defineMutationOptions({
  mutation: (payload: UpdateItemPayload) =>
    getRepositories().item.update(payload),
  onSuccess: (item) => {
    const queryCache = useQueryCache();
    queryCache.invalidateQueries({ key: ITEM_QUERY_KEYS.byCollection(item.collectionId) });
    queryCache.invalidateQueries({ key: ITEM_QUERY_KEYS.byId(item.id) });
  },
});

export const removeItemMutation = defineMutationOptions({
  mutation: (vars: { id: string; collectionId: string }) =>
    getRepositories().item.remove(vars.id),
  onSuccess: (_data, vars) => {
    const queryCache = useQueryCache();
    queryCache.invalidateQueries({ key: ITEM_QUERY_KEYS.byCollection(vars.collectionId) });
    queryCache.invalidateQueries({ key: ITEM_QUERY_KEYS.byId(vars.id) });
  },
});

export const moveItemMutation = defineMutationOptions({
  mutation: (payload: { id: string; groupId: string | null }) => getRepositories().item.move(payload),
  onSuccess: (item) => {
    const queryCache = useQueryCache();
    queryCache.invalidateQueries({ key: ITEM_QUERY_KEYS.byCollection(item.collectionId) });
    queryCache.invalidateQueries({ key: ITEM_QUERY_KEYS.byId(item.id) });
  },
});

const invalidateBatchItems = (collectionId: string, ids: string[]) => {
  const queryCache = useQueryCache();
  queryCache.invalidateQueries({ key: ITEM_QUERY_KEYS.byCollection(collectionId) });
  for (const id of new Set(ids)) {
    queryCache.invalidateQueries({ key: ITEM_QUERY_KEYS.byId(id) });
  }
};

export const removeItemsMutation = defineMutationOptions({
  mutation: (payload: ItemBatchPayload) => getRepositories().item.removeMany(payload),
  onSuccess: (_data, payload) => invalidateBatchItems(payload.collectionId, payload.ids),
});

export const moveItemsMutation = defineMutationOptions({
  mutation: (payload: Parameters<ItemRepository['moveMany']>[0]) => getRepositories().item.moveMany(payload),
  onSuccess: (_data, payload) => invalidateBatchItems(payload.collectionId, payload.ids),
});
