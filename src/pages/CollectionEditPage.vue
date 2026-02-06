<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Draggable from 'vuedraggable';
import PageHeader from '~/components/PageHeader.vue';
import PageHeaderActions from '~/components/PageHeaderActions.vue';
import PageHeaderTitle from '~/components/PageHeaderTitle.vue';
import { useRepositoryCollection } from '~/repositories';
import { useDataStore } from '~/stores/data';
import { useLoading } from '~/shared/lib/loading';
import { COLLECTION_FIELD_KIND_NAMES, COLLECTION_FIELD_KINDS, type CollectionFieldKind } from '~/types/entities';
import type { CollectionEditPageProps } from '~/types/pages';
import { RouteName } from '~/types/routes';
import { getRandomId } from '~/utils/getRandomId';

const { collection } = defineProps<CollectionEditPageProps>();

const router = useRouter();

const existingKeys = collection.fields.map(x => x.id);

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
  label: collection.label,
  fields: collection.fields.map(x => {
    return {
      key: x.id,
      kind: x.kind,
      label: x.label,
      suggestValue: !!x.suggestValue,
    };
  }),
});

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

const { startLoading, endLoading } = useLoading();
const { collections, setCollections } = useDataStore();

const repoCollection = useRepositoryCollection();

const handleSave = async () => {
  startLoading();
  try {
    if (!validate()) {
      return;
    }
    const { fields, label } = formData.value;

    if (existingKeys.some(key => keysToRemove.value.has(key))) {
      if (!confirm('Будут удалены некоторые сохраненные поля, продолжить?')) {
        return;
      }
    }

    const fieldsToSave = fields.filter(x => !keysToRemove.value.has(x.key));

    const updatedCollection = await repoCollection.update({
      id: collection.id,
      label,
      fields: fieldsToSave.map(x => ({
        id: x.key,
        kind: x.kind,
        label: x.label,
        suggestValue: !!x.suggestValue,
      })),
    });

    const updatedCollections = collections.value
      .filter(x => x.id != updatedCollection.id)
      .concat(updatedCollection);

    setCollections(updatedCollections);

    router.replace({ name: RouteName.Collection, params: { collectionId: collection.id } });
  } catch (err) {
    // TODO: refactor
    alert('Error: ' + String(err));
  } finally {
    endLoading();
  }
};

const handleDeleteField = (key: string) => {
  errors.value.fields[key] = undefined;
  if (existingKeys.includes(key)) {
    keysToRemove.value.add(key);
  } else {
    formData.value.fields = formData.value.fields.filter(x => x.key != key);
  }
};

const handleRestoreField = (key: string) => {
  keysToRemove.value.delete(key);
};

const getBorderClass = (key: string) => {
  if (errors.value.fields[key]) return 'border-error';
  if (existingKeys.includes(key)) return 'border-primary';
  return 'border-base-200';
};

const handleDeleteCollection = async (collectionId: string) => {
  if (!confirm('Удалить коллекцию?')) {
    return;
  }
  if (!confirm('Точно удалить? Вдруг там много важных записей?')) {
    return;
  }
  if (confirm('Может отменить удаление?')) {
    return;
  }
  if (!confirm('Ладно, последний раз, точно удалить?')) {
    return;
  }

  startLoading();
  try {
    await repoCollection.remove(collectionId);

    const updatedCollections = collections.value.filter(x => x.id != collectionId);

    setCollections(updatedCollections);

    router.go(-2);
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
        <PageHeaderTitle title="Редактирование коллекции" :subtitle="collection.label" />
        <PageHeaderActions>
          <button
            class="btn-header-action"
            title="Удалить коллекцию"
            @click="handleDeleteCollection(collection.id)"
          >
            <div class="i-[mdi--trash] text-error size-6"></div>
          </button>
        </PageHeaderActions>
      </PageHeader>
      <div class="grow min-h-0 px-2 py-4 pb-20 overflow-y-auto">
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
                class="p-2 border rounded-box flex gap-4"
                :class="[
                  getBorderClass(field.key),
                  {
                    'opacity-70': keysToRemove.has(field.key),
                  }
                ]"
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
                      :disabled="existingKeys.includes(field.key)"
                    >
                      <option v-for="kind in COLLECTION_FIELD_KINDS" :key="kind" :value="kind">
                        {{ COLLECTION_FIELD_KIND_NAMES[kind] }}
                      </option>
                    </select>
                  </label>

                  <label class="label">
                    <input v-model="field.suggestValue" type="checkbox" class="toggle" />
                    Подсказывать значения
                  </label>
                  <div
                    v-if="errors.fields[field.key]"
                    class="text-error"
                  >
                    {{ errors.fields[field.key] }}
                  </div>
                </div>
                <div class="flex items-start">
                  <button
                    v-if="keysToRemove.has(field.key)"
                    class="btn btn-info btn-sm btn-square"
                    title="Вернуть"
                    @click="handleRestoreField(field.key)"
                  >
                    <div class="i-[mdi--restore] size-6"></div>
                  </button>
                  <button
                    v-else
                    class="btn btn-error btn-sm btn-square"
                    title="Удалить"
                    @click="handleDeleteField(field.key)"
                  >
                    <div class="i-[mdi--close] size-6"></div>
                  </button>
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
