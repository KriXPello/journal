import { defineMutationOptions, defineQueryOptions, useQueryCache } from '@pinia/colada';
import type { GroupRepository } from '~/shared/storage/contracts';
import { getRepositories } from '~/shared/storage/instance';
import { GROUP_QUERY_KEYS, ITEM_QUERY_KEYS } from './keys';

export { GROUP_QUERY_KEYS } from './keys';

export const collectionGroupsQuery = defineQueryOptions(
  ({ collectionId }: { collectionId: string }) => ({
    key: GROUP_QUERY_KEYS.byCollection(collectionId),
    query: () => getRepositories().group.getCollectionGroups({ collectionId }),
  }),
);

const invalidateGroups = () => {
  useQueryCache().invalidateQueries({ key: GROUP_QUERY_KEYS.root });
};

export const createGroupMutation = defineMutationOptions({
  mutation: (payload: Parameters<GroupRepository['create']>[0]) => getRepositories().group.create(payload),
  onSuccess: invalidateGroups,
});

export const updateGroupMutation = defineMutationOptions({
  mutation: (payload: Parameters<GroupRepository['update']>[0]) => getRepositories().group.update(payload),
  onSuccess: invalidateGroups,
});

export const moveGroupMutation = defineMutationOptions({
  mutation: (payload: Parameters<GroupRepository['move']>[0]) => getRepositories().group.move(payload),
  onSuccess: invalidateGroups,
});

export const removeGroupMutation = defineMutationOptions({
  mutation: (id: string) => getRepositories().group.remove(id),
  onSuccess: () => {
    const queryCache = useQueryCache();
    queryCache.invalidateQueries({ key: GROUP_QUERY_KEYS.root });
    queryCache.invalidateQueries({ key: ITEM_QUERY_KEYS.root });
  },
});
