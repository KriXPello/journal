import { useMutation } from '@pinia/colada';
import { computed, ref, watch, type ComputedRef, type TemplateRef } from 'vue';
import type GroupDestinationDialog from '~/pages/collections/ui/GroupDestinationDialog.vue';
import { useAppNotify } from '~/shared/lib/interaction';
import { removeItemsMutation } from '~/shared/query';
import type { CollectionRow } from './collection-rows';
import type { useCollectionScope } from './useCollectionScope';

export const useCollectionSelection = (
  scope: ReturnType<typeof useCollectionScope>,
  rows: ComputedRef<CollectionRow[]>,
  destinationDialog: TemplateRef<InstanceType<typeof GroupDestinationDialog>>,
) => {
  const isSelecting = ref(false);
  const selectedIds = ref(new Set<string>());
  const { showError, confirmAction } = useAppNotify();
  const { mutateAsync: removeItems, isLoading: isRemoving } = useMutation(removeItemsMutation);
  const isBusy = computed(() => isRemoving.value || (destinationDialog.value?.isMoving ?? false));

  const availableIds = computed(() => {
    const ids = new Set<string>();
    for (const row of rows.value) {
      if (row.kind === 'item') ids.add(row.item.id);
    }
    return ids;
  });
  const availableCount = computed(() => availableIds.value.size);
  const selectedCount = computed(() => selectedIds.value.size);
  const allSelected = computed(() => availableCount.value > 0
    && [...availableIds.value].every(id => selectedIds.value.has(id)));
  const partiallySelected = computed(() => !allSelected.value
    && [...availableIds.value].some(id => selectedIds.value.has(id)));

  const startSelection = (id: string) => {
    if (isBusy.value || !availableIds.value.has(id)) return;

    isSelecting.value = true;
    selectedIds.value = new Set([id]);
  };

  const cancelSelection = () => {
    isSelecting.value = false;
    selectedIds.value = new Set();
  };

  const requestExit = async () => {
    if (isBusy.value) return;

    if (selectedCount.value > 0) {
      const confirmed = await confirmAction({
        message: 'Выйти из режима выделения?',
        acceptLabel: 'Выйти',
        rejectLabel: 'Отмена',
      });
      if (!confirmed) return;
    }
    cancelSelection();
  };

  const toggleItem = (id: string) => {
    if (isBusy.value || !availableIds.value.has(id)) return;

    const ids = new Set(selectedIds.value);
    if (ids.has(id)) {
      ids.delete(id);
    } else {
      ids.add(id);
    }
    selectedIds.value = ids;
  };

  const toggleAll = () => {
    if (isBusy.value) return;

    const ids = new Set(selectedIds.value);
    if (allSelected.value) {
      for (const id of availableIds.value) ids.delete(id);
    } else {
      for (const id of availableIds.value) ids.add(id);
    }
    selectedIds.value = ids;
  };

  const moveSelected = () => {
    if (isBusy.value || selectedCount.value === 0) return;

    destinationDialog.value?.open({
      kind: 'items',
      collectionId: scope.collectionId.value,
      ids: [...selectedIds.value],
      initialGroupId: scope.currentId.value,
    });
  };

  const removeSelected = async () => {
    if (isBusy.value || selectedCount.value === 0) return;

    const payload = { collectionId: scope.collectionId.value, ids: [...selectedIds.value] };
    const confirmed = await confirmAction({
      message: `Удалить выбранные записи (${payload.ids.length})? Это действие нельзя отменить.`,
      acceptLabel: 'Удалить записи',
      rejectLabel: 'Отмена',
    });
    if (!confirmed) return;

    try {
      await removeItems(payload);
      cancelSelection();
    } catch (err) {
      showError(String(err));
    }
  };

  watch(scope.collectionId, cancelSelection);

  return {
    isSelecting,
    selectedIds,
    selectedCount,
    availableCount,
    allSelected,
    partiallySelected,
    isBusy,
    startSelection,
    cancelSelection,
    requestExit,
    toggleItem,
    toggleAll,
    moveSelected,
    removeSelected,
  };
};
