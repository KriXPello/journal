<script setup lang="ts">
import PageHeaderAction from './PageHeaderAction.vue';

defineProps<{
  onBack?: () => void;
}>();

</script>

<template>
  <div class="px-2 py-2 flex flex-row items-center">
    <PageHeaderAction
      v-if="onBack"
      rounded
      text
      severity="secondary"
      class="mr-4"
      aria-label="Назад"
      @click="onBack"
    >
      <div class="i-[mdi--chevron-left] size-6" />
    </PageHeaderAction>
    <slot />
  </div>
</template>
