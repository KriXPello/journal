import { refDebounced, useLocalStorage } from '@vueuse/core';
import { computed, ref, watch } from 'vue';
import type { CollectionGroup } from '~/shared/types';
import { SEARCH_DEBOUNCE_MS, searchCollectionItems } from '~/shared/lib/search';
import { buildCollectionRows, type CollectionView } from './collection-rows';
import type { useCollectionScope } from './useCollectionScope';

export const useCollectionView = (scope: ReturnType<typeof useCollectionScope>) => {
  const savedViews = useLocalStorage<Record<string, CollectionView>>('journal:collection-views', {});
  const view = computed<CollectionView>({
    get: () => {
      if (savedViews.value[scope.collectionId.value] === 'tree') return 'tree';
      return 'navigation';
    },
    set: (value) => {
      savedViews.value = { ...savedViews.value, [scope.collectionId.value]: value };
    },
  });

  const expandedIds = ref(new Set<string>());
  const searchInput = ref('');
  const searchFieldIds = ref<string[]>([]);
  const searchQuery = refDebounced(searchInput, SEARCH_DEBOUNCE_MS);
  const searching = computed(() => searchQuery.value.trim().length > 0);

  watch(() => scope.collection.value?.id, (id) => {
    if (id) {
      searchFieldIds.value = scope.fields.value.map(field => field.id);
      expandedIds.value = new Set();
      searchInput.value = '';
    }
  }, { immediate: true });

  const searchedItems = computed(() => searchCollectionItems(scope.scopedItems.value, searchQuery.value, {
    selectedFieldIds: searchFieldIds.value,
    allFieldIds: scope.fields.value.map(field => field.id),
  }));

  const rows = computed(() => buildCollectionRows({
    hierarchy: scope.hierarchy.value,
    parentId: scope.currentId.value,
    view: view.value,
    items: searchedItems.value,
    searching: searching.value,
    expandedIds: expandedIds.value,
  }));

  const activateGroup = (group: CollectionGroup) => {
    switch (view.value) {
      case 'navigation':
        scope.navigateToGroup(group.id);
        break;
      case 'tree': {
        if (searching.value) return;

        const ids = new Set(expandedIds.value);
        if (ids.has(group.id)) {
          ids.delete(group.id);
        } else {
          ids.add(group.id);
        }
        expandedIds.value = ids;
        break;
      }
    }
  };

  return { view, searchInput, searchFieldIds, searchQuery, searching, rows, activateGroup };
};
