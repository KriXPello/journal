<script setup lang="ts">
import { useId } from 'vue';
import IftaLabel from 'primevue/iftalabel';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import type { CollectionField, Suggestion } from '~/shared/types';

defineProps<{
  field: CollectionField;
  suggestions: Suggestion[] | undefined;
}>();

const valueBind = defineModel<any>('value', { required: true });

const inputId = useId();
const datalistId = useId();

</script>

<template>
  <IftaLabel>
    <InputText
      v-if="field.kind == 'text'"
      :id="inputId"
      v-model.trim="valueBind"
      class="w-full"
      type="text"
      :list="datalistId"
    />
    <Textarea
      v-else-if="field.kind == 'textarea'"
      :id="inputId"
      v-model.trim="valueBind"
      class="w-full"
      rows="5"
      :list="datalistId"
    />
    <InputText
      v-else-if="field.kind == 'date'"
      :id="inputId"
      v-model="valueBind"
      class="w-full"
      type="date"
      :list="datalistId"
    />
    <InputNumber
      v-else-if="field.kind == 'number'"
      :id="inputId"
      v-model="valueBind"
      class="w-full input-number-no-arrows"
      :use-grouping="false"
      input-class="w-full input-number-no-arrows"
    />
    <label :for="inputId">{{ field.label }}</label>
  </IftaLabel>

  <datalist v-if="field.suggestValue && suggestions" :id="datalistId">
    <option
      v-for="suggestion in suggestions"
      :key="suggestion.key"
      :value="suggestion.text"
    ></option>
  </datalist>
</template>
