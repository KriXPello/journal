<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import type { CollectionField } from '~/shared/types';

const { fields } = defineProps<{
  fields: CollectionField[];
}>();

const modelValue = defineModel<string[]>({ required: true });

const isDialogVisible = ref(false);
const draftFieldIds = ref<string[]>([]);

const allFieldIds = computed(() => fields.map(field => field.id));

const isAllFieldsSelected = (ids: string[]) => {
  const all = allFieldIds.value;
  return all.length > 0 && ids.length === all.length && all.every(id => ids.includes(id));
};

const fieldFilterLabel = computed(() => {
  if (isAllFieldsSelected(modelValue.value)) {
    return 'все';
  }

  return String(modelValue.value.length);
});

const fieldFilterTitle = computed(() => {
  const ids = modelValue.value;

  if (isAllFieldsSelected(ids)) {
    return 'Все поля';
  }

  return ids
    .map(id => fields.find(field => field.id === id)?.label)
    .filter((label): label is string => label != undefined)
    .join(', ');
});

const isAllFieldsDraftSelected = computed(() => isAllFieldsSelected(draftFieldIds.value));

const allFieldsCheckboxId = useId();

const openDialog = () => {
  draftFieldIds.value = [...modelValue.value];
  isDialogVisible.value = true;
};

const handleCancel = () => {
  isDialogVisible.value = false;
};

const handleApply = () => {
  modelValue.value = [...draftFieldIds.value];
  isDialogVisible.value = false;
};

const handleAllFieldsChange = (checked: boolean | undefined) => {
  if (checked == undefined) {
    return;
  }

  draftFieldIds.value = checked ? [...allFieldIds.value] : [];
};

const isFieldDraftSelected = (fieldId: string) => {
  return draftFieldIds.value.includes(fieldId);
};

const handleFieldChange = (fieldId: string, checked: boolean | undefined) => {
  if (checked == undefined) {
    return;
  }

  const ids = [...draftFieldIds.value];

  if (checked) {
    if (!ids.includes(fieldId)) {
      ids.push(fieldId);
    }
  } else {
    const index = ids.indexOf(fieldId);
    if (index !== -1) {
      ids.splice(index, 1);
    }
  }

  draftFieldIds.value = ids;
};

watch(isDialogVisible, (visible) => {
  if (visible) {
    draftFieldIds.value = [...modelValue.value];
  }
});

</script>

<template>
  <Button
    type="button"
    outlined
    severity="secondary"
    class="min-w-0 flex-col"
    :title="fieldFilterTitle"
    :aria-label="`Фильтр полей: ${fieldFilterTitle ?? fieldFilterLabel}`"
    @click="openDialog"
  >
    <div class="flex items-center gap-0.5">
      <div class="i-[mdi--filter-outline] size-4 shrink-0" />
      <span class="text-sm leading-none tabular-nums">{{ fieldFilterLabel }}</span>
    </div>
  </Button>

  <Dialog
    v-model:visible="isDialogVisible"
    modal
    header="Поля поиска"
    class="w-full max-w-xl"
    :style="{ width: 'min(100vw - 1rem, 36rem)' }"
  >
    <div class="flex flex-col gap-3 pt-1">
      <div class="flex items-center gap-2">
        <Checkbox
          :input-id="allFieldsCheckboxId"
          :model-value="isAllFieldsDraftSelected"
          binary
          @update:model-value="handleAllFieldsChange"
        />
        <label :for="allFieldsCheckboxId" class="cursor-pointer select-none">
          Все поля
        </label>
      </div>

      <Divider />

      <div
        v-for="field in fields"
        :key="field.id"
        class="flex items-center gap-2"
      >
        <Checkbox
          :input-id="`${allFieldsCheckboxId}-${field.id}`"
          :model-value="isFieldDraftSelected(field.id)"
          binary
          @update:model-value="(checked) => handleFieldChange(field.id, checked)"
        />
        <label
          :for="`${allFieldsCheckboxId}-${field.id}`"
          class="cursor-pointer select-none"
        >
          {{ field.label }}
        </label>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Отмена"
          severity="secondary"
          text
          @click="handleCancel"
        />
        <Button
          type="button"
          label="Применить"
          @click="handleApply"
        />
      </div>
    </template>
  </Dialog>
</template>
