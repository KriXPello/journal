<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import PageHeader from '~/components/PageHeader.vue';
import PageHeaderActions from '~/components/PageHeaderActions.vue';
import PageHeaderTitle from '~/components/PageHeaderTitle.vue';
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

const collectionItems = computed(() => allItems.value.filter(x => x.collectionId == collection.id));

const handleAdd = () => {
  router.push({ name: RouteName.ItemCreate });
};

const searchInput = ref('');
const searchFieldId = ref('');

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

</script>

<template>
  <div class="size-full flex flex-col items-center relative">
    <div class="size-full px-2 max-w-xl relative flex flex-col">
      <PageHeader @back="router.back">
        <PageHeaderTitle title="Коллекция" :subtitle="collection.label" />
        <PageHeaderActions>
          <button
            class="btn-header-action"
            title="Обновить"
            @click="handleRefresh"
          >
            <div class="i-[mdi--refresh] size-6" />
          </button>
          <!-- <button
              class="btn-header-action"
              title="Настройки"
              @click="handleSettings"
            >
              <div class="i-[mdi--cog] size-6" />
            </button> -->
        </PageHeaderActions>
      </PageHeader>

      <div class="flex gap-1">
        <label class="floating-label w-40">
          <span>Поле</span>
          <select
            v-model="searchFieldId"
            class="select select-sm w-full"
          >
            <option value="">Все</option>
            <option v-for="field in collection.fields" :key="field.id" :value="field.id">
              {{ field.label }}
            </option>
          </select>
        </label>
        <label class="floating-label grow">
          <span>Значение</span>
          <input
            v-model="searchInput"
            class="input input-sm w-full"
            type="text"
          />
        </label>
      </div>

      <div class="grow min-h-0 mt-4 overflow-y-auto flex flex-col gap-2">
        <RouterLink
          v-for="item of searchedItems"
          :key="item.id"
          v-slot="{ href, navigate }"
          custom
          :to="{ name: RouteName.ItemEdit, params: { itemId: item.id }}"
        >
          <a
            :href="href"
            class="p-4 border border-base-200 rounded-box flex flex-col text-sm/5 hover:bg-base-200"
            @click="navigate"
          >
            <div
              v-for="field in collection.fields"
              :key="field.id"
              class="flex gap-1"
            >
              <span class="font-bold">{{ field.label }}:</span>
              <span class="line-clamp-2">{{ item.data[field.id] }}</span>
              <br>
            </div>
          </a>
        </RouterLink>
      </div>

      <div class="absolute z-2 bottom-0 right-0 p-4">
        <button class="btn btn-lg btn-circle btn-primary" @click="handleAdd">
          <div class="i-[mdi--plus] size-6" />
        </button>
      </div>
    </div>
  </div>
</template>
