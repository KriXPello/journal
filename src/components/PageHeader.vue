<script setup lang="ts">

defineProps<{
  onBack?: () => void;
}>();

</script>

<template>
  <div class="px-1 py-2 flex flex-row items-center">
    <button
      v-if="onBack"
      class="btn btn-circle btn-ghost mr-4"
      title="Назад"
      @click="onBack"
    >
      <div class="i-[mdi--chevron-left] size-6" />
    </button>
    <slot />
  </div>
</template>
