import { defineMutationOptions, defineQueryOptions, useQueryCache } from '@pinia/colada';
import type {
  PayloadCollectionCreate,
  PayloadCollectionUpdate,
} from '~/shared/storage/contracts';
import { getRepositories } from '~/shared/storage/instance';

export const COLLECTION_QUERY_KEYS = {
  root: ['collections'] as const,
  byId: (id: string) => [...COLLECTION_QUERY_KEYS.root, id] as const,
};

export const collectionsQuery = defineQueryOptions({
  key: COLLECTION_QUERY_KEYS.root,
  query: () => getRepositories().collection.getAll(),
});

export const collectionByIdQuery = defineQueryOptions(
  ({ id }: { id: string }) => ({
    key: COLLECTION_QUERY_KEYS.byId(id),
    query: async () => {
      const collection = await getRepositories().collection.getOne(id);
      if (!collection) {
        throw new Error(`Collection not found: ${id}`);
      }
      return collection;
    },
  }),
);

export const createCollectionMutation = defineMutationOptions({
  mutation: (payload: PayloadCollectionCreate) =>
    getRepositories().collection.create(payload),
  onSuccess: () => {
    useQueryCache().invalidateQueries({ key: COLLECTION_QUERY_KEYS.root });
  },
});

export const updateCollectionMutation = defineMutationOptions({
  mutation: (payload: PayloadCollectionUpdate) =>
    getRepositories().collection.update(payload),
  onSuccess: (collection) => {
    const queryCache = useQueryCache();
    queryCache.invalidateQueries({ key: COLLECTION_QUERY_KEYS.root });
    queryCache.invalidateQueries({ key: COLLECTION_QUERY_KEYS.byId(collection.id) });
  },
});

export const removeCollectionMutation = defineMutationOptions({
  mutation: (id: string) => getRepositories().collection.remove(id),
  onSuccess: (_data, id) => {
    const queryCache = useQueryCache();
    queryCache.invalidateQueries({ key: COLLECTION_QUERY_KEYS.root });
    queryCache.invalidateQueries({ key: COLLECTION_QUERY_KEYS.byId(id) });
  },
});
