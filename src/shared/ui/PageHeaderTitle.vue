<script setup lang="ts">

defineProps<{
  title: string;
  subtitle?: string;
}>();

</script>

<template>
  <div class="grow">
    <h1 class="text-xl font-bold">
      {{ title }}
    </h1>
    <h2 v-if="subtitle">
      {{ subtitle }}
    </h2>
  </div>
</template>