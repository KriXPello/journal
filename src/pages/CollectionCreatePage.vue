<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Draggable from 'vuedraggable';
import PageHeader from '~/components/PageHeader.vue';
import PageHeaderTitle from '~/components/PageHeaderTitle.vue';
import { useRepositoryCollection } from '~/repositories';
import { useDataStore } from '~/stores/data';
import { useLoadingStore } from '~/stores/loading';
import { COLLECTION_FIELD_KIND_NAMES, COLLECTION_FIELD_KINDS, type CollectionFieldKind } from '~/types/entities';
import { RouteName } from '~/types/routes';
import { getRandomId } from '~/utils/getRandomId';

const router = useRouter();


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
      })),
    });

    setCollections(collections.value.concat(newCollection));

    // TODO: open collection
    router.push({ name: RouteName.Collections });
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
      <PageHeader @back="router.back()">
        <PageHeaderTitle title="Создание коллекции" />
      </PageHeader>
      <div class="grow min-h-0 px-2 py-4 overflow-y-auto">
        <label class="floating-label">
          <span>Название коллекции</span>
          <input
            v-model.trim="formData.label"
            class="input"
            :class="{ 'input-error': errors.label }"
            type="text"
            @input="errors.label = ''"
          >
          <div
            v-if="errors.label"
            class="text-error"
          >
            {{ errors.label }}
          </div>
        </label>
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
                class="p-2 border border-base-200 rounded-box flex gap-4"
                :class="{ 'border-error': errors.fields[field.key] }"
              >
                <div class="flex items-center">
                  <div class="i-[mdi--drag-horizontal] text-secondary size-6 drag-handle"></div>
                </div>
                <div class="grow flex flex-col gap-2">
                  <label class="floating-label">
                    <span>Название поля</span>
                    <input
                      v-model.trim="field.label"
                      class="input w-full"
                      type="text"
                      @input="errors.fields[field.key] = ''"
                    >
                  </label>

                  <label class="floating-label">
                    <span>Тип поля</span>
                    <select
                      v-model="field.kind"
                      class="select w-full"
                    >
                      <option v-for="kind in COLLECTION_FIELD_KINDS" :key="kind" :value="kind">
                        {{ COLLECTION_FIELD_KIND_NAMES[kind] }}
                      </option>
                    </select>
                  </label>

                  <label class="label">
                    <input type="checkbox" :checked="field.suggestValue" class="toggle" />
                    Подсказывать значения
                  </label>
                  <div
                    v-if="errors.fields[field.key]"
                    class="text-error"
                  >
                    {{ errors.fields[field.key] }}
                  </div>
                </div>
              </div>
            </template>
          </Draggable>

          <button class="btn btn-dash" @click="handleAddField">
            <div class="i-[mdi--plus]" />
          </button>
        </div>
      </div>

      <div class="absolute z-2 bottom-0 right-0 p-4">
        <button class="btn btn-lg btn-circle btn-primary" @click="handleSave">
          <div class="i-[mdi--content-save-check-outline] size-6" />
        </button>
      </div>
    </div>
  </div>
</template>
