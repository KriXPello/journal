<script setup lang="ts">
import { computed, ref } from 'vue';
import { useMutation } from '@pinia/colada';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { createGroupHierarchy } from '~/pages/collections/model/group-hierarchy';
import { useAppNotify } from '~/shared/lib/interaction';
import { moveGroupMutation, moveItemMutation, moveItemsMutation } from '~/shared/query';
import type { CollectionGroup, Item } from '~/shared/types';

const props = defineProps<{
  groups: CollectionGroup[];
  collectionLabel: string;
}>();
type Target =
  | { kind: 'group'; group: CollectionGroup }
  | { kind: 'item'; item: Item }
  | { kind: 'items'; collectionId: string; ids: string[]; initialGroupId: string | null };

const emit = defineEmits<{ itemsMoved: [] }>();

const visible = ref(false);
const currentId = ref<string | null>(null);
const target = ref<Target | null>(null);
const { showError } = useAppNotify();
const { mutateAsync: moveGroup, isLoading: isMovingGroup } = useMutation(moveGroupMutation);
const { mutateAsync: moveItem, isLoading: isMovingItem } = useMutation(moveItemMutation);
const { mutateAsync: moveItems, isLoading: isMovingItems } = useMutation(moveItemsMutation);
const isMoving = computed(() => isMovingGroup.value || isMovingItem.value || isMovingItems.value);

const open = (newTarget: Target) => {
  target.value = newTarget;
  switch (newTarget.kind) {
    case 'group':
      currentId.value = newTarget.group.parentId;
      break;
    case 'item':
      currentId.value = newTarget.item.groupId;
      break;
    case 'items':
      currentId.value = newTarget.initialGroupId;
      break;
  }
  visible.value = true;
};

const hierarchy = computed(() => createGroupHierarchy(props.groups));
const blockedIds = computed(() => {
  const currentTarget = target.value;
  if (currentTarget?.kind === 'group') {
    const ids = hierarchy.value.getDescendantIds(currentTarget.group.id);
    ids.add(currentTarget.group.id);
    return ids;
  }
  return new Set<string>();
});
const children = computed(() =>
  (hierarchy.value.childrenByParent.get(currentId.value) ?? []).filter(group => !blockedIds.value.has(group.id)),
);
const currentGroup = computed(() => {
  if (currentId.value !== null) return hierarchy.value.byId.get(currentId.value);
  return undefined;
});
const path = computed(() => hierarchy.value.getPath(currentId.value).map(group => group.label).join(' / '));

const goBack = () => {
  currentId.value = currentGroup.value?.parentId ?? null;
};
const handleMove = async () => {
  const currentTarget = target.value;
  if (!currentTarget) return;

  try {
    switch (currentTarget.kind) {
      case 'group':
        await moveGroup({ id: currentTarget.group.id, parentId: currentId.value });
        break;
      case 'item':
        await moveItem({ id: currentTarget.item.id, groupId: currentId.value });
        break;
      case 'items':
        await moveItems({ collectionId: currentTarget.collectionId, ids: currentTarget.ids, groupId: currentId.value });
        emit('itemsMoved');
        break;
    }
    visible.value = false;
  } catch (err) {
    showError(String(err));
  }
};

defineExpose({ open, isMoving });
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Куда переместить?"
    :closable="!isMoving"
    :close-on-escape="!isMoving"
    :style="{ width: 'min(100vw - 1rem, 36rem)' }"
  >
    <div class="flex items-center gap-2 mb-3">
      <Button
        v-if="currentId !== null"
        text
        severity="secondary"
        aria-label="На уровень выше"
        :disabled="isMoving"
        @click="goBack"
      >
        <div class="i-[mdi--chevron-left] size-6" />
      </Button>
      <div class="min-w-0">
        <p class="font-semibold break-words">{{ collectionLabel }}</p>
        <p v-if="path" class="text-sm break-words">{{ path }}</p>
        <p v-else class="text-sm text-muted-color">Корень коллекции</p>
      </div>
    </div>
    <div class="flex flex-col gap-1 max-h-[50dvh] overflow-y-auto">
      <button
        v-for="group in children"
        :key="group.id"
        type="button"
        class="flex items-center gap-3 p-3 text-left rounded-lg border border-surface-200"
        :disabled="isMoving"
        @click="currentId = group.id"
      >
        <div class="i-[mdi--folder-outline] size-6 shrink-0" />
        <span class="grow break-words min-w-0">{{ group.label }}</span>
        <div class="i-[mdi--chevron-right] size-5 shrink-0" />
      </button>
      <p v-if="children.length === 0" class="py-4 text-sm text-muted-color">Нет доступных подгрупп</p>
    </div>
    <template #footer>
      <Button label="Отмена" text severity="secondary" :disabled="isMoving" @click="visible = false" />
      <Button label="Переместить сюда" :loading="isMoving" @click="handleMove" />
    </template>
  </Dialog>
</template>
