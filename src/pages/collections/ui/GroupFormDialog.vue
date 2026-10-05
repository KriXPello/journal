<script setup lang="ts">
import { computed, ref } from 'vue';
import { useMutation } from '@pinia/colada';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import IftaLabel from 'primevue/iftalabel';
import InputText from 'primevue/inputtext';
import { useAppNotify } from '~/shared/lib/interaction';
import { createGroupMutation, updateGroupMutation } from '~/shared/query';
import type { CollectionGroup } from '~/shared/types';

type FormMode = { kind: 'create'; parentId: string | null } | { kind: 'rename'; group: CollectionGroup };

const props = defineProps<{
  collectionId: string;
}>();

const visible = ref(false);
const label = ref('');
const error = ref('');
const mode = ref<FormMode>({ kind: 'create', parentId: null });
const { showError } = useAppNotify();
const { mutateAsync: createGroup, isLoading: isCreating } = useMutation(createGroupMutation);
const { mutateAsync: updateGroup, isLoading: isUpdating } = useMutation(updateGroupMutation);
const isSaving = computed(() => isCreating.value || isUpdating.value);
const title = computed(() => {
  if (mode.value.kind === 'rename') return 'Переименовать группу';
  return 'Создать группу';
});

const create = (parentId: string | null) => {
  mode.value = { kind: 'create', parentId };
  label.value = '';
  error.value = '';
  visible.value = true;
};

const rename = (group: CollectionGroup) => {
  mode.value = { kind: 'rename', group };
  label.value = group.label;
  error.value = '';
  visible.value = true;
};

const handleSave = async () => {
  const name = label.value.trim();
  if (!name) {
    error.value = 'Укажите название группы';
    return;
  }

  try {
    if (mode.value.kind === 'rename') {
      await updateGroup({ id: mode.value.group.id, label: name });
    } else {
      await createGroup({ collectionId: props.collectionId, parentId: mode.value.parentId, label: name });
    }
    visible.value = false;
  } catch (err) {
    showError(String(err));
  }
};

defineExpose({ create, rename });
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="title"
    :closable="!isSaving"
    :close-on-escape="!isSaving"
    :style="{ width: 'min(100vw - 1rem, 36rem)' }"
  >
    <form id="group-form" @submit.prevent="handleSave">
      <IftaLabel>
        <InputText
          id="group-label"
          v-model="label"
          autofocus
          class="w-full"
          :invalid="!!error"
          :disabled="isSaving"
          @input="error = ''"
        />
        <label for="group-label">Название группы</label>
      </IftaLabel>
      <p v-if="error" class="mt-2 text-danger">{{ error }}</p>
    </form>
    <template #footer>
      <Button label="Отмена" text severity="secondary" :disabled="isSaving" @click="visible = false" />
      <Button label="Сохранить" type="submit" form="group-form" :loading="isSaving" />
    </template>
  </Dialog>
</template>
