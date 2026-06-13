<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import Draggable from 'vuedraggable';
import Button from 'primevue/button';
import IftaLabel from 'primevue/iftalabel';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import ToggleSwitch from 'primevue/toggleswitch';
import { useDataStore, useLoadingStore } from '~/shared/lib/app-state';
import { COLLECTION_FIELD_KIND_NAMES, COLLECTION_FIELD_KINDS, type CollectionFieldKind } from '~/shared/types';
import { useAppNotify } from '~/shared/lib/interaction';
import { useRepositoryCollection } from '~/shared/storage';
import { getRandomId } from '~/shared/lib/system';
import { RouteName } from '~/shared/routes';
import { PageHeader, PageHeaderTitle } from '~/shared/ui';

const router = useRouter();
const { showError } = useAppNotify();

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
    suggestValue?: boolean;
  }>;
};

const formData = ref<FormData>({
  label: '',
  fields: [],
});

const handleAddField = () => {
  formData.value.fields.push({
    key: getRandomId(),
    kind: 'text',
    label: '',
  });
};

const errors = ref({
  label: '',
  fields: {} as Partial<Record<string, string>>,
});

const validate = () => {
  const { label, fields } = formData.value;
  let isValid = true;
  if (!label || !label.trim()) {
    errors.value.label = 'Обязательное поле';
    isValid = false;
  }
  fields.forEach((field) => {
    if (!field.label || !field.label.trim()) {
      errors.value.fields[field.key] = 'Название поля обязательно';
      isValid = false;
    }
  });
  return isValid;
};

const { startLoading, endLoading } = useLoadingStore();
const { collections, setCollections } = useDataStore();

const repoCollection = useRepositoryCollection();

const handleSave = async () => {
  startLoading();
  try {
    if (!validate()) {
      return;
    }
    const { fields, label } = formData.value;

    const newCollection = await repoCollection.create({
      label,
      fields: fields.map(x => ({
        kind: x.kind,
        label: x.label,
        suggestValue: !!x.suggestValue,
      })),
    });

    setCollections(collections.value.concat(newCollection));

    router.replace({ name: RouteName.Collection, params: { collectionId: newCollection.id } });
  } catch (err) {
    showError(String(err));
  } finally {
    endLoading();
  }
};

const handleDelete = (key: string) => {
  formData.value.fields = formData.value.fields.filter(x => x.key != key);
};

const collectionLabelId = 'collection-create-label';

</script>

<template>
  <div class="size-full flex flex-col items-center relative">
    <div class="size-full max-w-xl relative flex flex-col">
      <PageHeader @back="router.back()">
        <PageHeaderTitle title="Создание коллекции" />
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
                class="p-2 border border-surface-200 rounded-lg flex gap-4"
                :class="{ 'border-danger': errors.fields[field.key] }"
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
                    severity="danger"
                    size="small"
                    title="Удалить"
                    aria-label="Удалить"
                    @click="handleDelete(field.key)"
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
        <Button rounded size="large" aria-label="Сохранить" @click="handleSave">
          <div class="i-[mdi--content-save-check-outline] size-6" />
        </Button>
      </div>
    </div>
  </div>
</template>
