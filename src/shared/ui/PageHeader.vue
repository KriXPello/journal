<script setup lang="ts">
import Button from 'primevue/button';

defineProps<{
  onBack?: () => void;
}>();

</script>

<template>
  <div class="px-2 py-2 flex flex-row items-center">
    <Button
      v-if="onBack"
      rounded
      text
      severity="secondary"
      class="mr-4"
      aria-label="Назад"
      @click="onBack"
    >
      <div class="i-[mdi--chevron-left] size-6" />
    </Button>
    <slot />
  </div>
</template>
