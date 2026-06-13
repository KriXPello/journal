<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import IftaLabel from 'primevue/iftalabel';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import type { CollectionField, Suggestion } from '~/shared/types';

const props = defineProps<{
  field: CollectionField;
  suggestions?: Suggestion[];
}>();

const valueBind = defineModel<any>('value', { required: true });

const inputId = useId();
const isFocused = ref(false);

const usesSuggestions = computed(() => props.field.suggestValue === true);

const suggestionList = computed(() => props.suggestions ?? []);

const isSuggestionsOpen = computed(() =>
  usesSuggestions.value
  && isFocused.value
  && suggestionList.value.length > 0,
);

const handleFocusIn = () => {
  isFocused.value = true;
};

const handleFocusOut = (event: FocusEvent) => {
  const currentTarget = event.currentTarget;
  const relatedTarget = event.relatedTarget;

  if (
    currentTarget instanceof Node
    && relatedTarget instanceof Node
    && currentTarget.contains(relatedTarget)
  ) {
    return;
  }

  isFocused.value = false;
};

const applySuggestion = (text: string) => {
  if (props.field.kind === 'number') {
    const parsed = Number(text);
    valueBind.value = Number.isNaN(parsed) ? null : parsed;
  } else {
    valueBind.value = text;
  }

  isFocused.value = false;
};

</script>

<template>
  <div
    class="relative w-full"
    @focusin="handleFocusIn"
    @focusout="handleFocusOut"
  >
    <IftaLabel>
      <InputText
        v-if="field.kind == 'text'"
        :id="inputId"
        v-model.trim="valueBind"
        class="w-full"
        type="text"
        autocomplete="off"
      />
      <Textarea
        v-else-if="field.kind == 'textarea'"
        :id="inputId"
        v-model.trim="valueBind"
        class="w-full"
        rows="5"
        autocomplete="off"
      />
      <InputText
        v-else-if="field.kind == 'date'"
        :id="inputId"
        v-model="valueBind"
        class="w-full"
        type="date"
        autocomplete="off"
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

    <div
      v-if="isSuggestionsOpen"
      class="absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden rounded-lg border border-surface-200 bg-gray-50 shadow-md"
    >
      <ul class="m-0 max-h-48 list-none overflow-y-auto p-1">
        <li v-for="suggestion in suggestionList" :key="suggestion.key">
          <button
            type="button"
            class="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface-100"
            @mousedown.prevent
            @click="applySuggestion(suggestion.text)"
          >
            {{ suggestion.text }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
