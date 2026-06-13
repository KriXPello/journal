<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useQuery } from '@pinia/colada';
import Button from 'primevue/button';
import IftaLabel from 'primevue/iftalabel';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import type { CollectionPageProps } from '~/shared/routes';
import { searchCollectionItems } from '~/shared/lib/search';
import {
  collectionByIdQuery,
  collectionItemsQuery,
} from '~/shared/query';
import { RouteName } from '~/shared/routes';
import { PageHeader, PageHeaderActions, PageHeaderTitle } from '~/shared/ui';

const { collectionId } = defineProps<CollectionPageProps>();

const router = useRouter();

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

const handleRefresh = () => {
  refetchItems();
};

const handleAdd = () => {
  router.push({ name: RouteName.ItemCreate, params: { collectionId } });
};

const searchInput = ref('');
const searchFieldIds = ref<string[]>([]);

const searchFieldOptions = computed(() =>
  (collection.value?.fields ?? []).map(field => ({
    label: field.label,
    value: field.id,
  })),
);

const searchedItems = computed(() => {
  const list = collectionItems.value ?? [];
  const allFieldIds = (collection.value?.fields ?? []).map(field => field.id);

  return searchCollectionItems(list, searchInput.value, {
    selectedFieldIds: searchFieldIds.value,
    allFieldIds,
  });
});

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
          <Button
            rounded
            text
            severity="secondary"
            title="Обновить"
            aria-label="Обновить"
            :loading="isLoading"
            @click="handleRefresh"
          >
            <div class="i-[mdi--refresh] size-6" />
          </Button>
          <Button
            rounded
            text
            severity="secondary"
            title="Настройки"
            aria-label="Настройки"
            @click="handleSettings"
          >
            <div class="i-[mdi--cog] size-6" />
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <div class="flex gap-1">
        <IftaLabel class="w-40">
          <MultiSelect
            v-model="searchFieldIds"
            input-id="search-field"
            :options="searchFieldOptions"
            option-label="label"
            option-value="value"
            placeholder="Все поля"
            display="chip"
            class="w-full"
          />
          <label for="search-field">Поля</label>
        </IftaLabel>
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

      <div class="grow min-h-0 mt-4 pb-20 overflow-y-auto flex flex-col gap-2">
        <RouterLink
          v-for="item of searchedItems"
          :key="item.id"
          v-slot="{ href, navigate }"
          custom
          :to="{ name: RouteName.ItemEdit, params: { collectionId, itemId: item.id }}"
        >
          <a
            :href="href"
            class="p-4 border border-surface-200 rounded-lg flex flex-col text-sm/5 hover:bg-surface-100"
            @click="navigate"
          >
            <template v-for="field in collection.fields" :key="field.id">
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
      </div>

      <div class="absolute z-2 bottom-0 right-0 p-4">
        <Button rounded size="large" aria-label="Добавить" @click="handleAdd">
          <div class="i-[mdi--plus] size-6" />
        </Button>
      </div>
    </div>
  </div>
</template>
