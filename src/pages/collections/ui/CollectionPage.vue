<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useQuery } from '@pinia/colada';
import Button from 'primevue/button';
import IftaLabel from 'primevue/iftalabel';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import type { CollectionPageProps } from '~/shared/routes';
import { useDataStore, useLoadingStore } from '~/shared/lib/app-state';
import { useAppNotify } from '~/shared/lib/interaction';
import { useRepositoryItem } from '~/shared/storage';
import { RouteName } from '~/shared/routes';
import { PageHeader, PageHeaderActions, PageHeaderTitle } from '~/shared/ui';
import { QUERY_KEYS } from '~/shared/query';

const { collection } = defineProps<CollectionPageProps>();

const router = useRouter();
const { showError } = useAppNotify();

const { startLoading, endLoading } = useLoadingStore();

const itemsRepo = useRepositoryItem();

useQuery({
  key: () => QUERY_KEYS.collectionItems(collection.id),
  query: () => itemsRepo.getCollectionItems({
    collectionId: collection.id,
  }),
});

const { items: allItems, setItems } = useDataStore();

const handleRefresh = async () => {
  startLoading();
  try {
    const list = await itemsRepo.getAll();
    setItems(list);
  } catch (err) {
    showError(String(err));
  } finally {
    endLoading();
  }
};

const collectionItems = computed(() => allItems.value.filter(x => x.collectionId == collection.id));

const handleAdd = () => {
  router.push({ name: RouteName.ItemCreate });
};

const searchInput = ref('');
const searchFieldId = ref('');

const searchFieldOptions = computed(() => [
  { label: 'Все', value: '' },
  ...collection.fields.map(field => ({
    label: field.label,
    value: field.id,
  })),
]);

const searchedItems = computed(() => {
  const textInput = searchInput.value.toLocaleUpperCase();
  const list = collectionItems.value;
  const fieldId = searchFieldId.value;
  if (!textInput) {
    return list;
  }
  const filteredList = list.filter(item => {
    const valuesToCheck = fieldId == ''
      ? Object.values(item.data)
      : [item.data[fieldId]];

    const isMatches = valuesToCheck
      .filter(itemValue => itemValue != undefined)
      .map(itemValue => String(itemValue).toLocaleUpperCase().includes(textInput))
      .some(Boolean);
    return isMatches;
  });
  return filteredList;
});

const handleSettings = () => {
  router.push({ name: RouteName.CollectionEdit, params: { collectionId: collection.id } });
};

</script>

<template>
  <div class="size-full flex flex-col items-center relative">
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
          <Select
            v-model="searchFieldId"
            input-id="search-field"
            :options="searchFieldOptions"
            option-label="label"
            option-value="value"
            class="w-full"
            size="small"
          />
          <label for="search-field">Поле</label>
        </IftaLabel>
        <IftaLabel class="grow">
          <InputText
            id="search-value"
            v-model="searchInput"
            class="w-full"
            size="small"
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
          :to="{ name: RouteName.ItemEdit, params: { itemId: item.id }}"
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
