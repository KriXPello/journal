<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { CollectionField, Item } from '~/shared/types';
import { RouteName } from '~/shared/routes';

defineProps<{
  collectionId: string;
  item: Item;
  fields: CollectionField[];
}>();

</script>

<template>
  <RouterLink
    v-slot="{ href, navigate }"
    custom
    :to="{ name: RouteName.ItemEdit, params: { collectionId, itemId: item.id } }"
  >
    <a
      :href="href"
      class="mb-2 p-4 border border-surface-200 rounded-lg flex flex-col text-sm/5 hover:bg-surface-100"
      @click="navigate"
    >
      <template v-for="field in fields" :key="field.id">
        <div
          v-if="item.data[field.id]"
          class="flex gap-1"
        >
          <span class="font-bold">{{ field.label }}:</span>
          <span class="line-clamp-2">{{ item.data[field.id] }}</span>
          <br>
        </div>
      </template>
    </a>
  </RouterLink>
</template>
