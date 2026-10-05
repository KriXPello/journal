<script setup lang="ts">
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';

defineProps<{
  selectedCount: number;
  availableCount: number;
  allSelected: boolean;
  partiallySelected: boolean;
  busy: boolean;
}>();
const emit = defineEmits<{
  exit: [];
  toggleAll: [];
}>();
</script>

<template>
  <Teleport to="body">
    <footer
      class="fixed inset-x-0 bottom-0 z-10 border-t border-surface-200 bg-[var(--p-content-background)] shadow"
      role="region"
      aria-label="Действия с выбранными записями"
    >
      <div class="mx-auto flex min-h-16 max-w-xl justify-between px-4 py-2">
        <div class="flex items-center gap-2">
          <Checkbox
            binary
            :model-value="allSelected"
            :indeterminate="partiallySelected"
            :disabled="busy || availableCount === 0"
            aria-label="Выбрать все записи текущего списка"
            @update:model-value="emit('toggleAll')"
          />
          <p class="text-sm" aria-live="polite">Выбрано: {{ selectedCount }}</p>
        </div>
        <Button
          text
          rounded
          severity="secondary"
          aria-label="Выйти из режима выделения"
          :disabled="busy"
          @click="emit('exit')"
        >
          <i class="i-[mdi--close] size-6" />
        </Button>
      </div>
    </footer>
  </Teleport>
</template>

<style scoped>
footer {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
