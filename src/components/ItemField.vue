<script setup lang="ts">
import { useId } from 'vue';
import type { CollectionField, Item } from '~/types/entities';

const p = defineProps<{
  field: CollectionField;
  suggestions: Item[] | undefined;
}>();

const valueBind = defineModel<any>('value', { required: true });

const LIST_ID = useId();

</script>

<template>
  <label class="floating-label">
    <span>{{ field.label }}</span>
    <input
      v-if="field.kind == 'text'"
      v-model.trim="valueBind"
      class="input w-full"
      type="text"
      :list="LIST_ID"
    />
    <textarea
      v-else-if="field.kind == 'textarea'"
      v-model.trim="valueBind"
      class="textarea w-full"
      rows="5"
      :list="LIST_ID"
    ></textarea>
    <input
      v-else-if="field.kind == 'date'"
      v-model="valueBind"
      class="input w-full"
      type="date"
      :list="LIST_ID"
    />
    <input
      v-else-if="field.kind == 'number'"
      v-model.number="valueBind"
      class="input input-number-no-arrows w-full"
      type="number"
      :list="LIST_ID"
    />

    <datalist v-if="field.suggestValue && suggestions" :id="LIST_ID">
      <option
        v-for="suggestionItem in suggestions"
        :key="suggestionItem.id"
        :value="suggestionItem.data[field.id]"
      ></option>
    </datalist>
  </label>
</template>