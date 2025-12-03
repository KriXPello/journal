<script setup lang="ts">
import { ref } from 'vue';
import PageHeader from '~/components/PageHeader.vue';

type Tab = {
  id: string;
  name: string;
};

const tabs: Tab[] = [
  { id: '1', name: 'Продукты' },
  { id: '2', name: 'Книги' },
  { id: '3', name: 'Фильмы' },
  { id: '4', name: 'Сериалы' },
  { id: '5', name: 'Мультсериалы' },
];

const activeTabId = ref(tabs[0]!.id);

</script>

<template>
  <div class="size-full flex flex-col items-center relative">
    <div class="size-full max-w-xl relative flex flex-col">
      <PageHeader>Штуки</PageHeader>
      <div class="grow min-h-0">
        <div />
      </div>
      <div role="tablist" class="tabs tabs-sm tabs-border self-center overflow-x-auto flex-nowrap">
        <a
          v-for="tab in tabs"
          :key="tab.id"
          role="tab"
          class="tab text-nowrap"
          :class="{ 'tab-active': activeTabId == tab.id }"
          @click="activeTabId = tab.id"
        >{{ tab.name }}</a>
      </div>
    </div>
  </div>
</template>
