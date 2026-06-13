<script setup lang="ts">
import { refDebounced } from '@vueuse/core';
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuery } from '@pinia/colada';
import Button from 'primevue/button';
import IftaLabel from 'primevue/iftalabel';
import InputText from 'primevue/inputtext';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import type { DynamicScrollerExposed } from 'vue-virtual-scroller';
import CollectionFieldFilter from '~/pages/collections/ui/CollectionFieldFilter.vue';
import CollectionItemLink from '~/pages/collections/ui/CollectionItemLink.vue';
import type { CollectionPageProps } from '~/shared/routes';
import { SEARCH_DEBOUNCE_MS, searchCollectionItems } from '~/shared/lib/search';
import {
  collectionByIdQuery,
  collectionItemsQuery,
} from '~/shared/query';
import { RouteName } from '~/shared/routes';
import type { Item } from '~/shared/types';
import { PageHeader, PageHeaderAction, PageHeaderActions, PageHeaderTitle } from '~/shared/ui';

const VIRTUALIZATION_THRESHOLD = 50;
const MIN_ITEM_SIZE = 72;

const { collectionId } = defineProps<CollectionPageProps>();

const router = useRouter();
const scrollerRef = useTemplateRef<DynamicScrollerExposed<Item>>('scroller');

const { data: collection, error: collectionError, isLoading: isCollectionLoading } = useQuery(
  () => collectionByIdQuery({ id: collectionId }),
);

const { data: collectionItems, refetch: refetchItems, isLoading: isItemsLoading } = useQuery(
  () => collectionItemsQuery({ collectionId }),
);

watch(collectionError, (error) => {
  if (error) {
    router.replace({ name: RouteName.Collections });
  }
});

const searchInput = ref('');
const debouncedSearchInput = refDebounced(searchInput, SEARCH_DEBOUNCE_MS);
const searchFieldIds = ref<string[]>([]);
const isSearchFieldsInitialized = ref(false);

watch(
  () => collection.value?.fields,
  (fields) => {
    if (!fields || fields.length === 0 || isSearchFieldsInitialized.value) {
      return;
    }

    searchFieldIds.value = fields.map(field => field.id);
    isSearchFieldsInitialized.value = true;
  },
  { immediate: true },
);

const handleRefresh = () => {
  refetchItems();
};

const handleAdd = () => {
  router.push({ name: RouteName.ItemCreate, params: { collectionId } });
};

const searchedItems = computed(() => {
  const list = collectionItems.value ?? [];
  const allFieldIds = (collection.value?.fields ?? []).map(field => field.id);

  return searchCollectionItems(list, debouncedSearchInput.value, {
    selectedFieldIds: searchFieldIds.value,
    allFieldIds,
  });
});

const searchedItemsSignature = computed(() =>
  searchedItems.value.map(item => item.id).join('\n'),
);

watch([debouncedSearchInput, searchFieldIds], () => {
  nextTick(() => {
    scrollerRef.value?.scrollToPosition(0);
  });
}, { flush: 'post' });

watch(searchedItemsSignature, () => {
  nextTick(() => {
    scrollerRef.value?.forceUpdate(false);
  });
}, { flush: 'post' });

const handleSettings = () => {
  router.push({ name: RouteName.CollectionEdit, params: { collectionId } });
};

const isLoading = computed(() => isCollectionLoading.value || isItemsLoading.value);

</script>

<template>
  <div v-if="collection" class="size-full flex flex-col items-center relative">
    <div class="size-full px-2 max-w-xl relative flex flex-col">
      <PageHeader @back="router.back">
        <PageHeaderTitle title="Коллекция" :subtitle="collection.label" />
        <PageHeaderActions>
          <PageHeaderAction
            rounded
            text
            severity="secondary"
            title="Обновить"
            aria-label="Обновить"
            :loading="isLoading"
            @click="handleRefresh"
          >
            <div class="i-[mdi--refresh] size-6" />
          </PageHeaderAction>
          <PageHeaderAction
            rounded
            text
            severity="secondary"
            title="Настройки"
            aria-label="Настройки"
            @click="handleSettings"
          >
            <div class="i-[mdi--cog] size-6" />
          </PageHeaderAction>
        </PageHeaderActions>
      </PageHeader>

      <div class="flex gap-1">
        <CollectionFieldFilter
          v-model="searchFieldIds"
          :fields="collection.fields"
        />
        <IftaLabel class="grow">
          <InputText
            id="search-value"
            v-model="searchInput"
            class="w-full"
            type="text"
          />
          <label for="search-value">Значение</label>
        </IftaLabel>
      </div>

      <div class="grow min-h-0 mt-4">
        <DynamicScroller
          v-if="searchedItems.length > 0"
          ref="scroller"
          :items="searchedItems"
          key-field="id"
          :min-item-size="MIN_ITEM_SIZE"
          :enabled="(collectionItems?.length ?? 0) >= VIRTUALIZATION_THRESHOLD"
          flow-mode
          class="size-full pb-20"
        >
          <template #default="{ item, index, active }">
            <DynamicScrollerItem
              :item="item"
              :active="active"
              :index="index"
            >
              <CollectionItemLink
                v-if="active"
                :key="item.id"
                :collection-id="collectionId"
                :item="item"
                :fields="collection.fields"
              />
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>
      </div>

      <div class="absolute z-2 bottom-0 right-0 p-4">
        <Button rounded size="large" aria-label="Добавить" @click="handleAdd">
          <div class="i-[mdi--plus] size-6" />
        </Button>
      </div>
    </div>
  </div>
</template>
