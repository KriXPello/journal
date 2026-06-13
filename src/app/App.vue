<script setup lang="ts">
import { RouterLink, RouterView, type RouteLocationNamedRaw } from 'vue-router';
import ConfirmDialog from 'primevue/confirmdialog';
import ProgressSpinner from 'primevue/progressspinner';
import Toast from 'primevue/toast';
import { useRepositoryCollection, useRepositoryItem } from '~/shared/storage';
import { useDataStore, useLoadingStore } from '~/shared/lib/app-state';
import { useAppNotify } from '~/shared/lib/interaction';
import { RouteName } from '~/shared/routes';
import { InstallButton } from '~/shared/ui';


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
  {
    to: { name: RouteName.Settings },
    icon: 'i-[mdi--cog-outline]',
  },
];

const { startLoading, endLoading, isLoading } = useLoadingStore();
const { setCollections, setItems } = useDataStore();
const { showError } = useAppNotify();

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
    showError(String(err));
  } finally {
    endLoading();
  }
};

loadData();

</script>

<template>
  <Toast position="top-center" />
  <ConfirmDialog />
  <div class="size-full max-h-full overflow-hidden flex flex-col">
    <div class="grow min-h-0 w-full">
      <RouterView />
    </div>
    <nav class="flex items-center justify-center gap-8 border-t border-t-surface-200">
      <RouterLink
        v-for="page, index in pages"
        :key="index"
        v-slot="{ href, isActive, navigate }"
        :to="page.to"
        custom
      >
        <a
          class="block relative p-2 transition"
          :class="{ 'text-primary': isActive }"
          :href="href"
          @click="navigate"
        >
          <div
            class="size-10"
            :class="page.icon"
          />
          <div v-if="isActive" class="absolute bottom-2 inset-x-2 h-1 rounded-full bg-primary" />
        </a>
      </RouterLink>
      <InstallButton />
    </nav>
    <div
      v-show="isLoading"
      class="absolute scale-z-200 size-full flex items-center justify-center animate"
    >
      <ProgressSpinner class="spinner-delayed" />
    </div>
  </div>
</template>

<style scoped>
.spinner-delayed {
  opacity: 0;
  animation-name: showLoader;
  animation-duration: 0ms;
  animation-delay: 300ms;
  animation-fill-mode: forwards;
}

@keyframes showLoader {
  to { opacity: 1; }
}
</style>
