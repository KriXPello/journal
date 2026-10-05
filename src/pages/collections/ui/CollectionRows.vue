<script setup lang="ts">
import { nextTick, useTemplateRef, watch } from 'vue';
import Button from 'primevue/button';
import { DynamicScroller, DynamicScrollerItem, type DynamicScrollerExposed } from 'vue-virtual-scroller';
import type { CollectionRow, CollectionView } from '~/pages/collections/model/collection-rows';
import CollectionItemCard from '~/pages/collections/ui/CollectionItemCard.vue';
import type { CollectionField, CollectionGroup } from '~/shared/types';

const props = defineProps<{
  collectionId: string;
  fields: CollectionField[];
  rows: CollectionRow[];
  view: CollectionView;
  searching: boolean;
  loading: boolean;
  groupActionsDisabled: boolean;
  selectionActive: boolean;
  selectedIds: Set<string>;
  selectionDisabled: boolean;
}>();
const emit = defineEmits<{
  activateGroup: [group: CollectionGroup];
  groupMenu: [event: Event, group: CollectionGroup];
  toggleItem: [id: string];
  selectItem: [id: string];
}>();
const scroller = useTemplateRef<DynamicScrollerExposed<CollectionRow>>('scroller');

const scrollToStart = async () => {
  await nextTick();
  scroller.value?.scrollToPosition(0);
};

watch(() => props.rows, async () => {
  await nextTick();
  scroller.value?.forceUpdate(false);
}, { flush: 'post' });

defineExpose({ scrollToStart });
</script>

<template>
  <DynamicScroller
    v-if="rows.length > 0"
    ref="scroller"
    :items="rows"
    key-field="id"
    :min-item-size="64"
    flow-mode
    class="size-full pb-24"
  >
    <template #default="{ item: row, index, active }">
      <DynamicScrollerItem :item="row" :active="active" :index="index" :size-dependencies="[row, selectionActive]">
        <div
          v-if="active"
          :style="{ marginLeft: `${Math.min(row.depth, 4) * 12}px` }"
          :class="{ 'border-l border-surface-300 pl-2': row.depth > 0 }"
        >
          <div v-if="row.kind === 'group'" class="mb-2 flex items-center rounded-lg border border-surface-200">
            <button
              type="button"
              class="grow min-w-0 flex items-center gap-2 p-3 text-left"
              :aria-expanded="view === 'tree' && row.expanded"
              :disabled="selectionDisabled"
              @click="emit('activateGroup', row.group)"
            >
              <div
                v-if="view === 'tree'"
                class="size-5 shrink-0"
                :class="{ 'i-[mdi--chevron-down]': row.expanded, 'i-[mdi--chevron-right]': !row.expanded }"
              />
              <div class="i-[mdi--folder-outline] size-6 shrink-0" />
              <span class="grow min-w-0 break-words font-semibold">{{ row.group.label }}</span>
              <div v-if="view === 'navigation'" class="i-[mdi--chevron-right] size-5 shrink-0" />
            </button>
            <Button
              text
              rounded
              severity="secondary"
              :aria-label="`Действия с группой ${row.group.label}`"
              aria-haspopup="true"
              aria-controls="group-menu"
              :disabled="groupActionsDisabled"
              @click="emit('groupMenu', $event, row.group)"
            >
              <div class="i-[mdi--dots-vertical] size-5" />
            </Button>
          </div>
          <div v-else>
            <p v-if="row.path" class="mb-1 text-xs text-muted-color break-words">{{ row.path }}</p>
            <CollectionItemCard
              :item="row.item"
              :fields="fields"
              :collection-id="collectionId"
              :selecting="selectionActive"
              :selected="selectedIds.has(row.item.id)"
              :disabled="selectionDisabled"
              @select="emit('selectItem', $event)"
              @toggle="emit('toggleItem', $event)"
            />
          </div>
        </div>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
  <p v-else-if="!loading" class="py-6 text-center text-muted-color">
    <template v-if="searching">Ничего не найдено</template>
    <template v-else>Пока нет групп и записей</template>
  </p>
</template>
