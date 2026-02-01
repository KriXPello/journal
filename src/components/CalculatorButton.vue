<script setup lang="ts">

const p = defineProps<{
  onClick: (event: MouseEvent) => void;
}>();

</script>

<template>
  <button class="btn btn-circle" @click="onClick">
    <slot />
  </button>
</template>
