<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMutation, useQuery } from '@pinia/colada';
import Button from 'primevue/button';
import type { ItemCreatePageProps } from '~/shared/routes';
import { useItemSuggestions } from '~/pages/collections/model/useItemSuggestions';
import ItemField from '~/pages/collections/ui/ItemField.vue';
import { useAppNotify } from '~/shared/lib/interaction';
import {
  collectionByIdQuery,
  collectionItemsQuery,
  createItemMutation,
} from '~/shared/query';
import { PageHeader, PageHeaderTitle } from '~/shared/ui';

const { collectionId } = defineProps<ItemCreatePageProps>();

const router = useRouter();
const { showError } = useAppNotify();

const { data: collection, error: collectionError } = useQuery(
  () => collectionByIdQuery({ id: collectionId }),
);

const { data: collectionItems } = useQuery(
  () => collectionItemsQuery({ collectionId }),
);

watch(collectionError, () => {
  router.back();
});

const data = ref<Record<string, unknown>>({});

const itemsForSuggestions = computed(() => collectionItems.value ?? []);

const { suggestions } = useItemSuggestions({
  fields: computed(() => collection.value?.fields ?? []),
  data,
  items: itemsForSuggestions,
});

const { mutateAsync: createItem, isLoading } = useMutation(createItemMutation);

const handleSave = async () => {
  try {
    await createItem({
      collectionId,
      data: data.value,
    });

    router.back();
  } catch (err) {
    showError(String(err));
  }
};

</script>

<template>
  <div v-if="collection" class="size-full flex flex-col items-center relative">
    <div class="size-full max-w-xl relative flex flex-col">
      <PageHeader @back="router.back">
        <PageHeaderTitle
          title="Создание элемента"
          :subtitle="'Коллекция: ' + collection.label"
        />
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
        <Button
          rounded
          size="large"
          aria-label="Сохранить"
          :loading="isLoading"
          @click="handleSave"
        >
          <div class="i-[mdi--content-save-check-outline] size-6" />
        </Button>
      </div>
    </div>
  </div>
</template>
