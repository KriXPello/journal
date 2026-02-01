<script setup lang="ts">
import { VueDatePicker } from '@vuepic/vue-datepicker';
import { ru } from 'date-fns/locale';
import { computed, nextTick, ref, toRaw, useTemplateRef, watch } from 'vue';
import CalculatorControls from '~/components/CalculatorControls.vue';
import PageHeader from '~/components/PageHeader.vue';
import PageHeaderTitle from '~/components/PageHeaderTitle.vue';
import { vLongPress } from '~/directives/long-press';
import { useRepositoryFoodTake } from '~/repositories';
import { useLoadingStore } from '~/stores/loading';
import { CALCULATOR_OPERATIONS, DateObject, isCalculatorAction, isCalculatorOperand, isCalculatorOperation, type CalculatorExpression, type CalculatorInputValue, type FoodTake } from '~/types/entities';

const repoFoodTake = useRepositoryFoodTake();

const { startLoading, endLoading } = useLoadingStore();

const selectedDate = ref(new Date());

const takes = ref<FoodTake[]>([]);

const loadTakes = async (date: Date) => {
  const dateObject = DateObject.fromDate(date);
  startLoading();
  try {
    const group = await repoFoodTake.getGroupByDate(dateObject);
    if (group) {
      takes.value = group.takes;
    } else {
      takes.value = [];
    }
  } finally {
    endLoading();
  }
};

watch(selectedDate, (newDate) => loadTakes(newDate), { immediate: true });

const saveTakes = async (date: Date, list: FoodTake[]) => {
  console.log('save takes');
  list = toRaw(list);
  const dateObject = DateObject.fromDate(date);
  startLoading();
  try {
    await repoFoodTake.createOrUpdateGroup({ date: dateObject, takes: list });
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
const energyInputs = useTemplateRef('energyInputs');

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

const handleAddTake = () => {
  const take: FoodTake = {
    id: String(Date.now()) + Math.random(),
    energy: 0,
    weight: 100,
    label: '',
  };

  takes.value.push(take);
  sheduleSave();
  nextTick(() => {
    const newInput = energyInputs.value?.find(x => x.dataset['takeId'] == take.id);
    newInput?.select();

    const container = takesContainer.value;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  });
};

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

type LastTokenType = 'none' | 'number' | 'operator';
type ExpressionFSM = {
  expression: CalculatorExpression;
  lastTokenType: LastTokenType;
};

const expressionFsm = ref<ExpressionFSM>({
  expression: [],
  lastTokenType: 'none',
});

type InputPredicate = (value: CalculatorInputValue) => boolean;
type Action = (context: ExpressionFSM, value: CalculatorInputValue) => boolean;

const transitions: Record<LastTokenType, Action[]> = {
  'none': [
    ({ expression, lastTokenType }, value) => {
      if (isCalculatorOperand(value)) {
        // TODO
      }
    },
  ],
};

const handleCalculatorInput = (value: CalculatorInputValue) => {
  const { expression, lastTokenType } = expressionFsm.value;

  if (isCalculatorAction(value)) {
    // TODO:
  }

  const isOperand = isCalculatorOperand(value);
  const isOperation = isCalculatorOperation(value);


  if (lastTokenType == 'none') {
    // TODO
  }

  // TODO
};


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
        class="grow pb-16 overflow-y-auto"
      >
        <table class="table table-pin-rows table-sm">
          <thead>
            <tr>
              <th class="w-20">
                ккал/<br>100г.
              </th>
              <th class="w-20">
                вес,<br>грамм
              </th>
              <th>
                всего,<br>ккал
              </th>
              <th>
                продукт
              </th>
            </tr>
          </thead>
          <tbody class="select-none">
            <tr
              v-for="take in takes"
              :key="take.id"
              v-long-press="{
                onClick: () => handleClickRow(take.id),
                onLongPress: () => handleLongPressRow(take.id),
              }"
              :class="{ 'bg-accent/20': selectedTakesIds.has(take.id) }"
            >
              <td>
                <input
                  ref="energyInputs"
                  v-model.number="take.energy"
                  type="number"
                  class="input input-xs input-number-no-arrows select-auto"
                  min="0"
                  :data-take-id="take.id"
                  @input="sheduleSave"
                >
              </td>
              <td>
                <input
                  v-model.number="take.weight"
                  type="number"
                  class="input input-xs input-number-no-arrows select-auto"
                  min="0"
                  @input="sheduleSave"
                >
              </td>
              <td>{{ formatTakeTotal(calculateTakeTotal(take.energy, take.weight)) }}</td>
              <td>
                <input
                  v-model="take.label"
                  type="text"
                  class="input input-xs select-auto"
                  @input="sheduleSave"
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <CalculatorControls
        @input=""
      />

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

      <div class="absolute z-2 bottom-0 left-0 w-full p-4 flex justify-between items-center">
        <div class="badge badge-lg badge-info">
          {{ formatTakeTotal(takesTotalEnergy) }}
        </div>
        <button class="btn btn-lg btn-circle btn-primary" @click="handleAddTake">
          <div class="i-[mdi--plus] size-6" />
        </button>
      </div>
    </div>
  </div>
</template>
