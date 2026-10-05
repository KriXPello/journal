<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useRecordLongPress } from '~/pages/collections/model/useRecordLongPress';
import type { CollectionField, Item } from '~/shared/types';
import { RouteName } from '~/shared/routes';

const props = defineProps<{
  collectionId: string;
  item: Item;
  fields: CollectionField[];
  selecting: boolean;
  selected: boolean;
  disabled: boolean;
}>();
const emit = defineEmits<{
  select: [id: string];
  toggle: [id: string];
}>();

const { onPointerDown, onPointerMove, cancel, consumeClick, onContextMenu } = useRecordLongPress({
  itemId: () => props.item.id,
  enabled: () => !props.selecting && !props.disabled,
  onSelect: id => emit('select', id),
});

const linkAttributes = (href: string) => {
  if (props.selecting) {
    return { role: 'checkbox', 'aria-checked': props.selected, 'aria-disabled': props.disabled, tabindex: 0 };
  }
  return { href, 'aria-disabled': props.disabled };
};

const handleClick = (event: MouseEvent, navigate: (event: MouseEvent) => unknown) => {
  if (consumeClick(event)) return;
  if (props.disabled) {
    event.preventDefault();
    return;
  }
  if (props.selecting) {
    event.preventDefault();
    emit('toggle', props.item.id);
  } else {
    navigate(event);
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === ' ' || (event.key === 'Enter' && props.selecting)) {
    event.preventDefault();
    if (props.disabled || event.repeat) return;
    if (props.selecting) emit('toggle', props.item.id);
    else emit('select', props.item.id);
  }
};

</script>

<template>
  <RouterLink
    v-slot="{ href, navigate }"
    custom
    :to="{ name: RouteName.ItemEdit, params: { collectionId, itemId: item.id } }"
  >
    <a
      v-bind="linkAttributes(href)"
      class="record-card mb-2 p-4 border rounded-lg flex gap-3 text-sm/5 hover:bg-surface-100 select-none cursor-pointer"
      :class="{ 'border-primary bg-surface-100': selected, 'border-surface-200': !selected }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="cancel"
      @pointercancel="cancel"
      @pointerleave="cancel"
      @contextmenu="onContextMenu"
      @dragstart.prevent="cancel"
      @click="handleClick($event, navigate)"
      @keydown="handleKeydown"
    >
      <span
        v-if="selecting"
        aria-hidden="true"
        class="size-6 shrink-0 text-primary"
        :class="{ 'i-[mdi--checkbox-marked-outline]': selected, 'i-[mdi--checkbox-blank-outline]': !selected }"
      />
      <span class="min-w-0 grow flex flex-col">
        <template v-for="field in fields" :key="field.id">
          <span v-if="item.data[field.id]" class="flex gap-1">
            <span class="font-bold">{{ field.label }}:</span>
            <span class="line-clamp-2">{{ item.data[field.id] }}</span>
            <br>
          </span>
        </template>
      </span>
    </a>
  </RouterLink>
</template>

<style scoped>
.record-card {
  -webkit-touch-callout: none;
}
</style>
