import { useQuery } from '@pinia/colada';
import { computed, toValue, watch, type MaybeRefOrGetter } from 'vue';
import { useRouter } from 'vue-router';
import { collectionByIdQuery, collectionGroupsQuery, collectionItemsQuery } from '~/shared/query';
import { RouteName } from '~/shared/routes';
import { createGroupHierarchy } from './group-hierarchy';

export const useCollectionScope = (options: {
  collectionId: MaybeRefOrGetter<string>;
  groupId: MaybeRefOrGetter<string | undefined>;
}) => {
  const router = useRouter();
  const collectionId = computed(() => toValue(options.collectionId));
  const currentId = computed(() => toValue(options.groupId) ?? null);

  const { data: collection, error: collectionError, isLoading: isCollectionLoading } = useQuery(
    () => collectionByIdQuery({ id: collectionId.value }),
  );
  const { data: groupData, refetch: refetchGroups, isLoading: isGroupsLoading } = useQuery(
    () => collectionGroupsQuery({ collectionId: collectionId.value }),
  );
  const { data: itemData, refetch: refetchItems, isLoading: isItemsLoading } = useQuery(
    () => collectionItemsQuery({ collectionId: collectionId.value }),
  );

  const groups = computed(() => groupData.value ?? []);
  const items = computed(() => itemData.value ?? []);
  const fields = computed(() => collection.value?.fields ?? []);
  const hierarchy = computed(() => createGroupHierarchy(groups.value));
  const currentGroup = computed(() => {
    if (currentId.value !== null) return hierarchy.value.byId.get(currentId.value);
    return undefined;
  });
  const isLoading = computed(() => isCollectionLoading.value || isGroupsLoading.value || isItemsLoading.value);

  const header = computed(() => {
    const collectionLabel = collection.value?.label ?? '';
    if (currentGroup.value) {
      return { title: currentGroup.value.label, subtitle: collectionLabel };
    }
    return { title: collectionLabel, subtitle: 'Коллекция' };
  });

  const scopedItems = computed(() => {
    if (currentId.value === null) return items.value;

    const ids = hierarchy.value.getDescendantIds(currentId.value);
    ids.add(currentId.value);
    return items.value.filter(item => item.groupId !== null && ids.has(item.groupId));
  });

  const groupLocation = (groupId: string | null) => {
    if (groupId !== null) {
      return { name: RouteName.CollectionGroup, params: { collectionId: collectionId.value, groupId } };
    }
    return { name: RouteName.Collection, params: { collectionId: collectionId.value } };
  };

  const navigateToGroup = (groupId: string | null, replace = false) => {
    const destination = groupLocation(groupId);
    if (replace) return router.replace(destination);
    return router.push(destination);
  };

  const goBack = () => {
    let destination;
    if (currentGroup.value) {
      destination = groupLocation(currentGroup.value.parentId);
    } else {
      destination = { name: RouteName.Collections };
    }

    if (router.options.history.state.back === router.resolve(destination).fullPath) {
      router.back();
    } else {
      router.replace(destination);
    }
  };

  const createItem = (groupId: string | null) => {
    const query: Record<string, string> = {};
    if (groupId !== null) query.groupId = groupId;
    router.push({ name: RouteName.ItemCreate, params: { collectionId: collectionId.value }, query });
  };

  const openSettings = () => {
    router.push({ name: RouteName.CollectionEdit, params: { collectionId: collectionId.value } });
  };

  const refresh = () => {
    refetchItems();
    refetchGroups();
  };

  watch(collectionError, (error) => {
    if (error) router.replace({ name: RouteName.Collections });
  });
  watch([currentId, groupData], () => {
    if (currentId.value !== null && groupData.value && !currentGroup.value) {
      navigateToGroup(null, true);
    }
  }, { immediate: true });

  return {
    collectionId,
    collection,
    groups,
    fields,
    hierarchy,
    currentId,
    currentGroup,
    scopedItems,
    header,
    isLoading,
    isGroupsLoading,
    navigateToGroup,
    goBack,
    createItem,
    openSettings,
    refresh,
  };
};
