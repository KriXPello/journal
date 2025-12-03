<script setup lang="ts">
import { ref } from 'vue';
import PageHeader from '~/components/PageHeader.vue';
import { COLLECTION_FIELD_KIND_NAMES, COLLECTION_FIELD_KINDS, type CollectionFieldKind } from '~/types/entities';
import { getRandomId } from '~/utils/getRandomId';

type FormData = {
  label: string;
  fields: Array<{
    key: string;
    label: string;
    kind: CollectionFieldKind;
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

</script>

<template>
  <div class="size-full flex flex-col items-center relative">
    <div class="size-full max-w-xl relative flex flex-col">
      <PageHeader>
        Создание коллекции
      </PageHeader>
      <div class="grow min-h-0 px-2 py-4 overflow-y-auto">
        <label class="floating-label">
          <span>Название коллекции</span>
          <input v-model.trim="formData.label" class="input" type="text">
        </label>
        <h2 class="mt-4 text-lg font-bold">
          Схема записей
        </h2>
        <div class="flex flex-col gap-2">
          <div
            v-for="field in formData.fields"
            :key="field.key"
            class="p-2 border border-base-200 rounded-box flex gap-4"
          >
            <div class="flex flex-col gap-2 justify-center">
              <button class="btn btn-xs" />
              <button class="btn btn-xs" />
            </div>
            <div class="grow flex flex-col gap-2">
              <label class="floating-label">
                <span>Название поля</span>
                <input v-model.trim="field.label" class="input" type="text">
              </label>

              <label class="floating-label">
                <span>Тип поля</span>
                <select
                  v-model="field.kind"
                  class="select"
                >
                  <option v-for="kind in COLLECTION_FIELD_KINDS" :key="kind" :value="kind">
                    {{ COLLECTION_FIELD_KIND_NAMES[kind] }}
                  </option>
                </select>
              </label>
            </div>
          </div>
          <button class="btn btn-dash" @click="handleAddField">
            <div class="i-[mdi--plus]" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
