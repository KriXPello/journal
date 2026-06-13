<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMutation, useQuery } from '@pinia/colada';
import Button from 'primevue/button';
import type { ItemEditPageProps } from '~/shared/routes';
import { useItemSuggestions } from '~/pages/collections/model/useItemSuggestions';
import ItemField from '~/pages/collections/ui/ItemField.vue';
import { useAppNotify } from '~/shared/lib/interaction';
import {
  collectionByIdQuery,
  collectionItemsQuery,
  itemByIdQuery,
  removeItemMutation,
  updateItemMutation,
} from '~/shared/query';
import { RouteName } from '~/shared/routes';
import { PageHeader, PageHeaderActions, PageHeaderTitle } from '~/shared/ui';

const { collectionId, itemId } = defineProps<ItemEditPageProps>();

const router = useRouter();
const { showError, confirmAction } = useAppNotify();

const { data: collection, error: collectionError } = useQuery(
  () => collectionByIdQuery({ id: collectionId }),
);

const { data: item, error: itemError } = useQuery(
  () => itemByIdQuery({ id: itemId }),
);

const { data: collectionItems } = useQuery(
  () => collectionItemsQuery({ collectionId }),
);

watch([collectionError, itemError], ([collectionErr, itemErr]) => {
  if (collectionErr || itemErr) {
    router.replace({ name: RouteName.Collection, params: { collectionId } });
  }
});

const data = ref<Record<string, unknown>>({});

watch(item, (value) => {
  if (value) {
    data.value = { ...value.data };
  }
}, { immediate: true });

const itemsForSuggestions = computed(() => collectionItems.value ?? []);

const { suggestions } = useItemSuggestions({
  fields: computed(() => collection.value?.fields ?? []),
  data,
  items: itemsForSuggestions,
});

const { mutateAsync: updateItem, isLoading: isSaving } = useMutation(updateItemMutation);
const { mutateAsync: removeItem, isLoading: isRemoving } = useMutation(removeItemMutation);

const handleSave = async () => {
  try {
    await updateItem({
      id: itemId,
      data: data.value,
    });

    router.back();
  } catch (err) {
    showError(String(err));
  }
};

const handleDelete = async () => {
  const isConfirmed = await confirmAction({ message: 'Удалить элемент?' });
  if (!isConfirmed) {
    return;
  }

  try {
    await removeItem({ id: itemId, collectionId });
    router.back();
  } catch (err) {
    showError(String(err));
  }
};

const isLoading = computed(() => isSaving.value || isRemoving.value);

</script>

<template>
  <div v-if="collection && item" class="size-full flex flex-col items-center relative">
    <div class="size-full max-w-xl relative flex flex-col">
      <PageHeader @back="router.back">
        <PageHeaderTitle
          title="Редактирование элемента"
          :subtitle="'Коллекция: ' + collection.label"
        />
        <PageHeaderActions>
          <Button
            rounded
            text
            severity="secondary"
            title="Удалить элемент"
            aria-label="Удалить элемент"
            :loading="isRemoving"
            @click="handleDelete"
          >
            <div class="i-[mdi--trash] text-danger size-6" />
          </Button>
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
