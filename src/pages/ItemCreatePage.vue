<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ItemField from '~/components/ItemField.vue';
import PageHeader from '~/components/PageHeader.vue';
import PageHeaderTitle from '~/components/PageHeaderTitle.vue';
import { useItemSuggestions } from '~/composables/useItemSuggestions';
import { useRepositoryItem } from '~/repositories';
import { useDataStore } from '~/stores/data';
import { useLoadingStore } from '~/stores/loading';
import type { ItemCreatePageProps } from '~/types/pages';

const { collection } = defineProps<ItemCreatePageProps>();

const router = useRouter();

const data = ref<Record<string, unknown>>({});

const { items: allItems, setItems } = useDataStore();
const collectionItems = allItems.value.filter(x => x.collectionId == collection.id);

const { suggestions } = useItemSuggestions({
  fields: collection.fields,
  data,
  items: collectionItems,
});

const { startLoading, endLoading } = useLoadingStore();

const repoItem = useRepositoryItem();

const handleSave = async () => {
  startLoading();
  try {
    const newItem = await repoItem.create({
      collectionId: collection.id,
      data: data.value,
    });

    setItems(allItems.value.concat(newItem));

    router.back();
  } catch (err) {
    // TODO: refactor
    alert('Error: ' + String(err));
  } finally {
    endLoading();
  }
};

</script>

<template>
  <div class="size-full flex flex-col items-center relative">
    <div class="size-full max-w-xl relative flex flex-col">
      <PageHeader @back="router.back">
        <PageHeaderTitle
          title="Создание элемента"
          :subtitle="'Коллекция: ' + collection.label"
        />
      </PageHeader>
      <div class="grow min-h-0 px-2 py-4 overflow-y-auto flex flex-col gap-4">
        <ItemField
          v-for="field in collection.fields"
          :key="field.id"
          v-model:value="data[field.id]"
          :field="field"
          :suggestions="suggestions[field.id]?.value"
        />
      </div>

      <div class="absolute z-2 bottom-0 right-0 p-4">
        <button class="btn btn-lg btn-circle btn-primary" @click="handleSave">
          <div class="i-[mdi--content-save-check-outline] size-6" />
        </button>
      </div>
    </div>
  </div>
</template>