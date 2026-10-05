import { useMutation } from '@pinia/colada';
import { computed, ref, type TemplateRef, type WritableComputedRef } from 'vue';
import type Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import type GroupFormDialog from '~/pages/collections/ui/GroupFormDialog.vue';
import type GroupDestinationDialog from '~/pages/collections/ui/GroupDestinationDialog.vue';
import { useAppNotify } from '~/shared/lib/interaction';
import { removeGroupMutation } from '~/shared/query';
import type { CollectionGroup } from '~/shared/types';
import type { CollectionView } from './collection-rows';
import type { useCollectionScope } from './useCollectionScope';
import type { useCollectionSelection } from './useCollectionSelection';

export const useCollectionActions = (
  scope: ReturnType<typeof useCollectionScope>,
  view: WritableComputedRef<CollectionView>,
  selection: ReturnType<typeof useCollectionSelection>,
  refs: {
    groupMenu: TemplateRef<InstanceType<typeof Menu>>;
    groupForm: TemplateRef<InstanceType<typeof GroupFormDialog>>;
    groupDestination: TemplateRef<InstanceType<typeof GroupDestinationDialog>>;
  },
) => {
  const { groupMenu, groupForm, groupDestination } = refs;
  const selectedGroup = ref<CollectionGroup | null>(null);
  const { showError, confirmAction } = useAppNotify();
  const { mutateAsync: removeGroup, isLoading: isRemoving } = useMutation(removeGroupMutation);
  const isGroupBusy = computed(() => isRemoving.value || (groupDestination.value?.isMoving ?? false));

  const handleRemove = async (group: CollectionGroup) => {
    const confirmed = await confirmAction({
      message: `Удалить группу «${group.label}»? Её записи и подгруппы будут перемещены на уровень выше.`,
      acceptLabel: 'Удалить группу',
      rejectLabel: 'Отмена',
    });
    if (!confirmed) return;

    try {
      await removeGroup(group.id);
      if (scope.currentId.value === group.id) scope.navigateToGroup(group.parentId, true);
    } catch (err) {
      showError(String(err));
    }
  };

  const managementActions = (group: CollectionGroup): MenuItem[] => [
    {
      label: 'Переименовать',
      command: () => groupForm.value?.rename(group),
    },
    {
      label: 'Переместить',
      command: () => groupDestination.value?.open({ kind: 'group', group }),
    },
    {
      label: 'Удалить группу',
      command: () => handleRemove(group),
    },
  ];

  const groupActions = computed<MenuItem[]>(() => {
    const group = selectedGroup.value;
    if (!group) return [];

    return [
      {
        label: 'Открыть группу',
        command: () => scope.navigateToGroup(group.id),
      },
      {
        label: 'Создать запись',
        command: () => scope.createItem(group.id),
      },
      {
        label: 'Создать подгруппу',
        command: () => groupForm.value?.create(group.id),
      },
      { separator: true },
      ...managementActions(group),
    ];
  });

  const pageActions = computed<MenuItem[]>(() => {
    if (selection.isSelecting.value) {
      const disabled = selection.isBusy.value || selection.selectedCount.value === 0;
      return [
        {
          label: 'Переместить выбранные',
          disabled: disabled || scope.isGroupsLoading.value,
          command: selection.moveSelected,
        },
        {
          label: 'Удалить выбранные',
          disabled,
          command: selection.removeSelected,
        },
      ];
    }

    const actions: MenuItem[] = [
      {
        label: 'Создать группу',
        command: () => groupForm.value?.create(scope.currentId.value),
      },
      {
        label: 'Вид: по группам',
        disabled: view.value === 'navigation',
        command: () => { view.value = 'navigation'; },
      },
      {
        label: 'Вид: дерево',
        disabled: view.value === 'tree',
        command: () => { view.value = 'tree'; },
      },
    ];

    if (scope.currentGroup.value) {
      actions.push(
        { separator: true },
        { label: 'Действия с группой', items: managementActions(scope.currentGroup.value) },
      );
    }
    actions.push(
      { separator: true },
      { label: 'Настройки коллекции', command: scope.openSettings },
    );
    return actions;
  });

  const openGroupMenu = (event: Event, group: CollectionGroup) => {
    selectedGroup.value = group;
    groupMenu.value?.toggle(event);
  };

  return { pageActions, groupActions, isGroupBusy, openGroupMenu };
};
