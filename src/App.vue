<script setup lang="ts">
import { RouterLink, RouterView, type RouteLocationNamedRaw } from 'vue-router';
import { RouteName } from '~/types/routes';
import InstallButton from './components/InstallButton.vue';
import { useRepositoryCollection, useRepositoryItem } from './repositories';
import { useDataStore } from './stores/data';
import { useLoadingStore } from './stores/loading';


type Page = {
  to: RouteLocationNamedRaw;
  icon: string;
};

const pages: Page[] = [
  {
    to: { name: RouteName.Main },
    icon: 'i-[mdi--calculator-variant]',
  },
  {
    to: { name: RouteName.Collections },
    icon: 'i-[mdi--database]',
  },
];

const { startLoading, endLoading, isLoading } = useLoadingStore();
const { setCollections, setItems } = useDataStore();

const repoCollection = useRepositoryCollection();
const repoItem = useRepositoryItem();

const loadData = async () => {
  startLoading();
  try {
    const [collections, items] = await Promise.all([
      repoCollection.getAll(),
      repoItem.getAll(),
    ]);

    setCollections(collections);
    setItems(items);
  } catch (err) {
    // TODO: refactor
    alert('Error: ' + String(err));
  } finally {
    endLoading();
  }
};

loadData();

</script>

<template>
  <div class="size-full max-h-full overflow-hidden flex flex-col">
    <div class="grow min-h-0 w-full">
      <RouterView />
    </div>
    <nav class="flex justify-center gap-8 border-t border-t-base-200">
      <RouterLink
        v-for="page, index in pages"
        :key="index"
        v-slot="{ href, isActive, navigate }"
        :to="page.to"
        custom
      >
        <a
          class="block relative p-2 transition"
          :class="{ 'text-accent': isActive }"
          :href="href"
          @click="navigate"
        >
          <div
            class="size-10"
            :class="page.icon"
          />
          <div v-if="isActive" class="absolute bottom-2 inset-x-2 h-1 rounded-full bg-accent" />
        </a>
      </RouterLink>
      <InstallButton />
    </nav>
    <div
      v-show="isLoading"
      class="absolute scale-z-200 size-full flex items-center justify-center"
    >
      <span class="loading loading-bars loading-xl"></span>
    </div>
  </div>
</template>

