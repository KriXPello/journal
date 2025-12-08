<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ItemField from '~/components/ItemField.vue';
import PageHeader from '~/components/PageHeader.vue';
import PageHeaderActions from '~/components/PageHeaderActions.vue';
import PageHeaderTitle from '~/components/PageHeaderTitle.vue';
import { useItemSuggestions } from '~/composables/useItemSuggestions';
import { useRepositoryItem } from '~/repositories';
import { useDataStore } from '~/stores/data';
import { useLoadingStore } from '~/stores/loading';
import type { ItemEditPageProps } from '~/types/pages';

const { collection, item } = defineProps<ItemEditPageProps>();

const router = useRouter();

const data = ref<Record<string, unknown>>({ ...item.data });

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
    const updatedItem = await repoItem.update({
      id: item.id,
      data: data.value,
    });

    const updatedItems = allItems.value
      .filter(x => x.id != updatedItem.id)
      .concat(updatedItem);

    setItems(updatedItems);

    router.back();
  } catch (err) {
    // TODO: refactor
    alert('Error: ' + String(err));
  } finally {
    endLoading();
  }
};

const handleDelete = async (id: string) => {
  if (!confirm('Удалить элемент?')) {
    return;
  }
  startLoading();
  try {
    await repoItem.remove(id);

    const updatedItems = allItems.value.filter(x => x.id != id);

    setItems(updatedItems);

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
          title="Редактирование элемента"
          :subtitle="'Коллекция: ' + collection.label"
        />
        <PageHeaderActions>
          <button class="btn-header-action" title="Удалить элемент" @click="handleDelete(item.id)">
            <div class="i-[mdi--trash] text-error size-6"></div>
          </button>
        </PageHeaderActions>
      </PageHeader>
      <div class="grow min-h-0 px-2 py-4 pb-20 overflow-y-auto flex flex-col gap-4">
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