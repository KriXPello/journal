<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import PageHeader from '~/components/PageHeader.vue';
import { useRepositoryItem } from '~/repositories';
import { useDataStore } from '~/stores/data';
import { useLoadingStore } from '~/stores/loading';
import type { CollectionPageProps } from '~/types/pages';
import { RouteName } from '~/types/routes';

const { collection } = defineProps<CollectionPageProps>();

const router = useRouter();

const { startLoading, endLoading } = useLoadingStore();

const { items: allItems, setItems } = useDataStore();
const repoItem = useRepositoryItem();

const handleRefresh = async () => {
  startLoading();
  try {
    const list = await repoItem.getAll();
    setItems(list);
  } catch (err) {
    // TODO: refactor
    alert('Error: ' + String(err));
  } finally {
    endLoading();
  }
};

const handleCreate = () => {
  
};

const collectionItems = computed(() => allItems.value.filter(x => x.collectionId == collection.id));

</script>

<template>
  <div class="size-full flex flex-col items-center relative">
    <div class="size-full max-w-xl relative flex flex-col">
      <PageHeader @back="router.back">
        {{ collection.label }}
        <template #extra>
          <div class="flex gap-2">
            <button
              class="btn btn-circle btn-ghost btn-sm"
              title="Обновить"
              @click="handleRefresh"
            >
              <div class="i-[mdi--refresh] size-6" />
            </button>
            <!-- <button
                class="btn btn-circle btn-ghost btn-sm"
                title="Настройки"
                @click="handleSettings"
              >
                <div class="i-[mdi--cog] size-6" />
              </button> -->
          </div>
        </template>
      </PageHeader>
      <div class="grow min-h-0 overflow-y-auto">
        <RouterLink
          v-for="item of collectionItems" 
          :key="item.id"
          v-slot="{ href, navigate }"
          custom
          :to="{ name: RouteName.Collection, params: { id: item.id }}"
        >
          <a
            :href="href"
            class="p-4 border border-base-200 rounded-box flex gap-4"
            @click="navigate"
          >
            
          </a>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
