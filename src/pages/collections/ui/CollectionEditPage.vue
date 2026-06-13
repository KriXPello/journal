<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMutation, useQuery } from '@pinia/colada';
import Draggable from 'vuedraggable';
import Button from 'primevue/button';
import IftaLabel from 'primevue/iftalabel';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import ToggleSwitch from 'primevue/toggleswitch';
import type { CollectionEditPageProps } from '~/shared/routes';
import { COLLECTION_FIELD_KIND_NAMES, COLLECTION_FIELD_KINDS, type CollectionFieldKind } from '~/shared/types';
import { useAppNotify } from '~/shared/lib/interaction';
import {
  collectionByIdQuery,
  removeCollectionMutation,
  updateCollectionMutation,
} from '~/shared/query';
import { getRandomId } from '~/shared/lib/system';
import { RouteName } from '~/shared/routes';
import { PageHeader, PageHeaderAction, PageHeaderActions, PageHeaderTitle } from '~/shared/ui';

const { collectionId } = defineProps<CollectionEditPageProps>();

const router = useRouter();
const { showError, confirmAction } = useAppNotify();

const { data: collection, error: collectionError } = useQuery(
  () => collectionByIdQuery({ id: collectionId }),
);

watch(collectionError, (error) => {
  if (error) {
    router.replace({ name: RouteName.Collections });
  }
});

const fieldKindOptions = computed(() => COLLECTION_FIELD_KINDS.map(kind => ({
  label: COLLECTION_FIELD_KIND_NAMES[kind],
  value: kind,
})));

type FormData = {
  label: string;
  fields: Array<{
    key: string;
    label: string;
    kind: CollectionFieldKind;
    suggestValue: boolean;
  }>;
};

const formData = ref<FormData>({
  label: '',
  fields: [],
});

const existingKeys = ref<string[]>([]);
const isFormInitialized = ref(false);

watch(collection, (value) => {
  if (!value || isFormInitialized.value) {
    return;
  }
  existingKeys.value = value.fields.map(x => x.id);
  formData.value = {
    label: value.label,
    fields: value.fields.map(x => ({
      key: x.id,
      kind: x.kind,
      label: x.label,
      suggestValue: !!x.suggestValue,
    })),
  };
  isFormInitialized.value = true;
}, { immediate: true });

const keysToRemove = ref(new Set<string>());

const handleAddField = () => {
  formData.value.fields.push({
    key: getRandomId(),
    kind: 'text',
    label: '',
    suggestValue: false,
  });
};

const errors = ref({
  label: '',
  fields: {} as Partial<Record<string, string>>,
});

const validate = () => {
  const { label, fields } = formData.value;
  errors.value = {
    label: '',
    fields: {},
  };
  let isValid = true;
  if (!label || !label.trim()) {
    errors.value.label = 'Обязательное поле';
    isValid = false;
  }
  fields.filter(x => !keysToRemove.value.has(x.key)).forEach((field) => {
    if (!field.label || !field.label.trim()) {
      errors.value.fields[field.key] = 'Название поля обязательно';
      isValid = false;
    }
  });
  return isValid;
};

const { mutateAsync: updateCollection, isLoading: isSaving } = useMutation(updateCollectionMutation);
const { mutateAsync: removeCollection, isLoading: isRemoving } = useMutation(removeCollectionMutation);

const handleSave = async () => {
  if (!validate()) {
    return;
  }
  const { fields, label } = formData.value;

  if (existingKeys.value.some(key => keysToRemove.value.has(key))) {
    const isConfirmed = await confirmAction({
      message: 'Будут удалены некоторые сохраненные поля, продолжить?',
    });
    if (!isConfirmed) {
      return;
    }
  }

  const fieldsToSave = fields.filter(x => !keysToRemove.value.has(x.key));

  try {
    await updateCollection({
      id: collectionId,
      label,
      fields: fieldsToSave.map(x => ({
        id: x.key,
        kind: x.kind,
        label: x.label,
        suggestValue: !!x.suggestValue,
      })),
    });

    router.replace({ name: RouteName.Collection, params: { collectionId } });
  } catch (err) {
    showError(String(err));
  }
};

const handleDeleteField = (key: string) => {
  errors.value.fields[key] = undefined;
  if (existingKeys.value.includes(key)) {
    keysToRemove.value.add(key);
  } else {
    formData.value.fields = formData.value.fields.filter(x => x.key != key);
  }
};

const handleRestoreField = (key: string) => {
  keysToRemove.value.delete(key);
};

const getBorderClass = (key: string) => {
  if (errors.value.fields[key]) return 'border-danger';
  if (existingKeys.value.includes(key)) return 'border-primary';
  return 'border-surface-200';
};

const handleDeleteCollection = async () => {
  if (!await confirmAction({ message: 'Удалить коллекцию?' })) {
    return;
  }
  if (!await confirmAction({ message: 'Точно удалить? Вдруг там много важных записей?' })) {
    return;
  }
  if (await confirmAction({ message: 'Может отменить удаление?' })) {
    return;
  }
  if (!await confirmAction({ message: 'Ладно, последний раз, точно удалить?' })) {
    return;
  }

  try {
    await removeCollection(collectionId);
    router.go(-2);
  } catch (err) {
    showError(String(err));
  }
};

const collectionLabelId = `collection-edit-label-${collectionId}`;
const isLoading = computed(() => isSaving.value || isRemoving.value);

</script>

<template>
  <div v-if="collection" class="size-full flex flex-col items-center relative">
    <div class="size-full max-w-xl relative flex flex-col">
      <PageHeader @back="router.back()">
        <PageHeaderTitle title="Редактирование коллекции" :subtitle="collection.label" />
        <PageHeaderActions>
          <PageHeaderAction
            rounded
            text
            severity="secondary"
            title="Удалить коллекцию"
            aria-label="Удалить коллекцию"
            :loading="isRemoving"
            @click="handleDeleteCollection"
          >
            <div class="i-[mdi--trash] text-danger size-6"></div>
          </PageHeaderAction>
        </PageHeaderActions>
      </PageHeader>
      <div class="grow min-h-0 px-2 py-4 pb-20 overflow-y-auto">
        <IftaLabel>
          <InputText
            :id="collectionLabelId"
            v-model.trim="formData.label"
            class="w-full"
            :invalid="!!errors.label"
            type="text"
            @input="errors.label = ''"
          />
          <label :for="collectionLabelId">Название коллекции</label>
        </IftaLabel>
        <div
          v-if="errors.label"
          class="text-danger mt-1"
        >
          {{ errors.label }}
        </div>
        <h2 class="mt-4 text-lg font-bold">
          Схема записей
        </h2>
        <div class="flex flex-col gap-2">
          <Draggable
            v-model="formData.fields"
            class="flex flex-col gap-2"
            handle=".drag-handle"
            item-key="key"
          >
            <template #item="{ element: field }">
              <div
                class="p-2 border rounded-lg flex gap-4"
                :class="[
                  getBorderClass(field.key),
                  {
                    'opacity-70': keysToRemove.has(field.key),
                  }
                ]"
              >
                <div class="flex items-center">
                  <div class="i-[mdi--drag-horizontal] text-gray-500 size-6 drag-handle"></div>
                </div>
                <div class="grow flex flex-col gap-2">
                  <IftaLabel>
                    <InputText
                      :id="`field-label-${field.key}`"
                      v-model.trim="field.label"
                      class="w-full"
                      type="text"
                      @input="errors.fields[field.key] = ''"
                    />
                    <label :for="`field-label-${field.key}`">Название поля</label>
                  </IftaLabel>

                  <IftaLabel>
                    <Select
                      v-model="field.kind"
                      :input-id="`field-kind-${field.key}`"
                      :options="fieldKindOptions"
                      option-label="label"
                      option-value="value"
                      class="w-full"
                      :disabled="existingKeys.includes(field.key)"
                    />
                    <label :for="`field-kind-${field.key}`">Тип поля</label>
                  </IftaLabel>

                  <label class="flex items-center gap-2">
                    <ToggleSwitch v-model="field.suggestValue" />
                    Подсказывать значения
                  </label>
                  <div
                    v-if="errors.fields[field.key]"
                    class="text-danger"
                  >
                    {{ errors.fields[field.key] }}
                  </div>
                </div>
                <div class="flex items-start">
                  <Button
                    v-if="keysToRemove.has(field.key)"
                    severity="info"
                    size="small"
                    title="Вернуть"
                    aria-label="Вернуть"
                    @click="handleRestoreField(field.key)"
                  >
                    <div class="i-[mdi--restore] size-6"></div>
                  </Button>
                  <Button
                    v-else
                    severity="danger"
                    size="small"
                    title="Удалить"
                    aria-label="Удалить"
                    @click="handleDeleteField(field.key)"
                  >
                    <div class="i-[mdi--close] size-6"></div>
                  </Button>
                </div>
              </div>
            </template>
          </Draggable>

          <Button outlined class="w-full" @click="handleAddField">
            <div class="i-[mdi--plus]" />
          </Button>
        </div>
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
