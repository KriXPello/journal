<script setup lang="ts">
import { RouterLink, RouterView, type RouteLocationNamedRaw } from 'vue-router';
import { RouteName } from '~/types/routes';


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
    </nav>
  </div>
</template>

