<script setup lang="ts">
import { RouterLink, RouterView, type RouteLocationNamedRaw } from 'vue-router';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
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
  </div>
</template>
