<script setup lang="ts">
import { VueDatePicker } from '@vuepic/vue-datepicker';
import { ru } from 'date-fns/locale';
import { computed, ref, toRaw, useTemplateRef, watch } from 'vue';
import PageHeader from '~/components/PageHeader.vue';
import PageHeaderTitle from '~/components/PageHeaderTitle.vue';
import { useRepositoryCalculationDay } from '~/repositories';
import { useBindLoading } from '~/shared/lib/loading';
import { DateObject, type FoodTake } from '~/types/entities';
import { useCalculationDay } from '../model/useCalculationDay';
import { useCalculatorInput } from '../model/useCalculatorInput';
import CalculatorControls from './CalculatorControls.vue';
import { useCalculationDaySave } from '~/pages/calculation/model/useCalculationDaySave';

const repoFoodTake = useRepositoryCalculationDay();

const selectedDate = ref(new Date());

const {
  calculationDay,
  error: calculationDayError,
  isLoading: calculationDayLoading,
  loadCalculationDay,
} = useCalculationDay();

useBindLoading(calculationDayLoading);

watch(selectedDate, (newDate) => {
  const activeDay = calculationDay.value;
  if (activeDay && DateObject.isEqual(activeDay.date, DateObject.fromDate(newDate))) {
    return;
  }
  loadCalculationDay(newDate);
}, { immediate: true });

const {
  error: saveCalculationDayError,
  isLoading: saveCalculationDayLoading,
  saveCalculationDay,
} = useCalculationDaySave();

const saveTakes = async (date: Date, list: FoodTake[]) => {
  console.log('save takes');
  list = toRaw(list);
  const dateObject = DateObject.fromDate(date);
  startLoading();
  try {
    await repoFoodTake.createOrUpdate({ date: dateObject, takes: list });
  } finally {
    endLoading();
  }
};

const debounceTimeoutByDate = new Map<string, number>();
const saveTakesWithDebounce = (date: Date, list: FoodTake[]) => {
  const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  if (debounceTimeoutByDate.has(key)) {
    clearTimeout(debounceTimeoutByDate.get(key));
  }
  const timeout = setTimeout(() => {
    saveTakes(date, list);
  }, 500);
  debounceTimeoutByDate.set(key, timeout);
};

const sheduleSave = () => {
  saveTakesWithDebounce(selectedDate.value, takes.value);
};

const takesContainer = useTemplateRef('takesContainer');

const calculateTakeTotal = (kkal: number, weightGramm: number) => {
  return kkal * weightGramm / 100;
};

const formatTakeTotal = (value: number) => {
  value = Math.max(0, value || 0);
  return Math.round(value);
};

const takesTotalEnergy = computed(() => takes.value.reduce(
  (acc, x) => acc + calculateTakeTotal(x.energy || 0, x.weight || 0), 0),
);

const selectedTakesIds = ref(new Set<string>());

const isSelectionMode = computed(() => selectedTakesIds.value.size > 0);

const toggleSelect = (id: string) => {
  if (selectedTakesIds.value.has(id)) {
    selectedTakesIds.value.delete(id);
  } else {
    selectedTakesIds.value.add(id);
  }
};

const handleLongPressRow = (id: string) => {
  if (isSelectionMode.value) {
    return;
  }
  selectedTakesIds.value.add(id);
};

const handleClickRow = (id: string) => {
  if (!isSelectionMode.value) {
    return;
  }
  toggleSelect(id);
};

const handleClearSelection = () => {
  selectedTakesIds.value.clear();
};

const handleDeleteSelected = () => {
  const isConfirmed = confirm('Удалить выбранные записи?');
  if (isConfirmed) {
    const selectedSet = selectedTakesIds.value;
    takes.value = takes.value.filter(x => !selectedSet.has(x.id));
    selectedTakesIds.value.clear();
    sheduleSave();
  }
};

const dateModal = useTemplateRef('dateModal');
const showDateModal = () => {
  dateModal.value?.showModal();
};
const closeDateModal = () => {
  dateModal.value?.close();
};

const handleCalendarChange = (date: Date) => {
  selectedDate.value = date;
  closeDateModal();
};

const handlePrevDate = () => {
  handleCalendarChange(new Date(Number(selectedDate.value) - 86400000));
};

const handleNextDate = () => {
  handleCalendarChange(new Date(Number(selectedDate.value) + 86400000));
};

const readableSelectedDate = computed(() => {
  return selectedDate.value.toLocaleDateString();
});

const activeInputRef = useTemplateRef<HTMLTextAreaElement>('activeInputRef');

const { expression, handleCalculatorInput } = useCalculatorInput({
  getCursorPosIndex: () => activeInputRef.value?.selectionEnd || 0,
  setCursorPosIndex: (index) => {
    const input = activeInputRef.value;
    if (input) {
      input.focus(); // required
      input.setSelectionRange(index, index);
    }
  },
});


</script>

<template>
  <div class="size-full flex flex-col items-center">
    <div class="size-full max-w-xl relative flex flex-col">
      <PageHeader>
        <PageHeaderTitle title="Калькулятор калорий" />
      </PageHeader>
      <div class="px-2">
        <div class="flex items-center justify-center gap-6">
          <button class="btn btn-ghost btn-circle" @click="handlePrevDate">
            <div class="i-[mdi--skip-previous] size-6"></div>
          </button>

          <a class="link link-accent ml-1" @click="showDateModal()">{{ readableSelectedDate }}</a>

          <button class="btn btn-ghost btn-circle" @click="handleNextDate">
            <div class="i-[mdi--skip-next] size-6"></div>
          </button>
        </div>
        <dialog ref="dateModal" class="modal modal-bottom sm:modal-middle">
          <div class="modal-box p-2">
            <div class="flex flex-row items-center justify-between">
              <h3 class="text-lg font-bold">Выбор даты</h3>
              <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost" @click="closeDateModal()">✕</button>
              </form>
            </div>

            <VueDatePicker
              :model-value="selectedDate"
              class="w-full mt-2"
              inline
              auto-apply
              :locale="ru"
              :time-config="{ enableTimePicker: false }"
              :ui="{ menu: 'w-full' }"
              @update:model-value="handleCalendarChange"
            />
          </div>
        </dialog>
      </div>
      <div
        ref="takesContainer"
        class="grow-4 overflow-y-auto"
      >
        <textarea

          ref="activeInputRef"
          v-model="expression"
          class="textarea resize-none"
          inputmode="none"
        />
      </div>

      <CalculatorControls
        class="grow-6"
        @input="handleCalculatorInput"
      />

      <!-- TODO: remove/refactor -->
      <div
        v-if="selectedTakesIds.size"
        class="absolute z-2 w-full px-2 py-1 flex gap-4 items-center bg-base-200 rounded-b-box shadow-lg"
      >
        <button
          class="btn btn-circle"
          title="Снять выделение"
          @click="handleClearSelection"
        >
          <div class="i-[mdi--close] size-6" />
        </button>

        <div class="text-lg" title="Выбрано">
          {{ selectedTakesIds.size }}
        </div>

        <div class="grow" />

        <button
          class="btn btn-circle btn-ghost hover:btn-error"
          title="Удалить выбранные"
          @click="handleDeleteSelected"
        >
          <div class="i-[mdi--trash] size-6" />
        </button>
      </div>

      <!-- <div class="absolute z-2 bottom-0 left-0 w-full p-4 flex justify-between items-center">
        <div class="badge badge-lg badge-info">
          {{ formatTakeTotal(takesTotalEnergy) }}
        </div>
      </div> -->
    </div>
  </div>
</template>
