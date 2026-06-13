import { defineMutationOptions, defineQueryOptions, useQueryCache } from '@pinia/colada';
import type {
  CreateItemPayload,
  UpdateItemPayload,
} from '~/shared/storage/contracts';
import { getRepositories } from '~/shared/storage/instance';

export const ITEM_QUERY_KEYS = {
  root: ['items'] as const,
  byId: (id: string) => [...ITEM_QUERY_KEYS.root, id] as const,
  byCollection: (collectionId: string) =>
    [...ITEM_QUERY_KEYS.root, 'by-collection', collectionId] as const,
};

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
