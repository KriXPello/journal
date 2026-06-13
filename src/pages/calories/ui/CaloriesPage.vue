<script setup lang="ts">
import { VueDatePicker } from '@vuepic/vue-datepicker';
import { ru } from 'date-fns/locale';
import { computed, nextTick, ref, toRaw, useTemplateRef, watch } from 'vue';
import { useMutation, useQuery } from '@pinia/colada';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import CalculatorControls from '~/pages/calories/ui/CalculatorControls.vue';
import { DateObject, type FoodTake } from '~/shared/types';
import { vLongPress, useAppNotify } from '~/shared/lib/interaction';
import {
  foodTakeGroupByDateQuery,
  upsertFoodTakeGroupMutation,
} from '~/shared/query';
import { PageHeader, PageHeaderTitle } from '~/shared/ui';

const { confirmAction } = useAppNotify();

const selectedDate = ref(new Date());
const dateObject = computed(() => DateObject.fromDate(selectedDate.value));

const { data: serverTakes, isLoading: isQueryLoading } = useQuery(
  () => foodTakeGroupByDateQuery({ date: dateObject.value }),
);

const { mutateAsync: upsertGroup, isLoading: isSaving } = useMutation(upsertFoodTakeGroupMutation);

const takes = ref<FoodTake[]>([]);

watch(serverTakes, (value) => {
  takes.value = value ? value.map(take => ({ ...take })) : [];
}, { immediate: true });

const debounceTimeoutByDate = new Map<string, ReturnType<typeof setTimeout>>();

const saveTakes = async (date: Date, list: FoodTake[]) => {
  const payload = toRaw(list);
  await upsertGroup({
    date: DateObject.fromDate(date),
    takes: payload,
  });
};

const saveTakesWithDebounce = (date: Date, list: FoodTake[]) => {
  const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const existingTimeout = debounceTimeoutByDate.get(key);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
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

const focusEnergyInput = (takeId: string) => {
  const input = takesContainer.value?.querySelector(`[data-take-id="${takeId}"] input`);
  (input as HTMLInputElement | null)?.select();
};

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
    focusEnergyInput(take.id);

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

const handleDeleteSelected = async () => {
  const isConfirmed = await confirmAction({ message: 'Удалить выбранные записи?' });
  if (isConfirmed) {
    const selectedSet = selectedTakesIds.value;
    takes.value = takes.value.filter(x => !selectedSet.has(x.id));
    selectedTakesIds.value.clear();
    sheduleSave();
  }
};

const isDateModalVisible = ref(false);

const showDateModal = () => {
  isDateModalVisible.value = true;
};

const closeDateModal = () => {
  isDateModalVisible.value = false;
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

const handleCalculatorInput = () => {
  // TODO: calculator input is part of the later calories redesign.
};

const isLoading = computed(() => isQueryLoading.value || isSaving.value);

</script>

<template>
  <div class="size-full flex flex-col items-center">
    <div class="size-full max-w-xl relative flex flex-col">
      <PageHeader>
        <PageHeaderTitle title="Калькулятор калорий" />
      </PageHeader>
      <div class="px-2">
        <div class="flex items-center justify-center gap-6">
          <Button rounded text severity="secondary" aria-label="Предыдущий день" @click="handlePrevDate">
            <div class="i-[mdi--skip-previous] size-6"></div>
          </Button>

          <Button
            link
            class="ml-1"
            :label="readableSelectedDate"
            @click="showDateModal()"
          />

          <Button rounded text severity="secondary" aria-label="Следующий день" @click="handleNextDate">
            <div class="i-[mdi--skip-next] size-6"></div>
          </Button>
        </div>
        <Dialog
          v-model:visible="isDateModalVisible"
          modal
          header="Выбор даты"
          class="w-full max-w-xl"
          :style="{ width: 'min(100vw - 1rem, 36rem)' }"
        >
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
        </Dialog>
      </div>
      <div
        ref="takesContainer"
        class="grow pb-16 overflow-y-auto"
        :class="{ 'opacity-60 pointer-events-none': isLoading }"
      >
        <table class="w-full text-sm border-collapse">
          <thead class="sticky top-0 bg-surface-ground">
            <tr>
              <th class="w-20 text-left font-medium p-1">
                ккал/<br>100г.
              </th>
              <th class="w-20 text-left font-medium p-1">
                вес,<br>грамм
              </th>
              <th class="text-left font-medium p-1">
                всего,<br>ккал
              </th>
              <th class="text-left font-medium p-1">
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
              :class="{ 'bg-primary/20': selectedTakesIds.has(take.id) }"
            >
              <td class="p-0.5">
                <InputNumber
                  v-model="take.energy"
                  :data-take-id="take.id"
                  class="w-full input-number-no-arrows"
                  input-class="w-full input-number-no-arrows text-xs p-1"
                  :min="0"
                  :use-grouping="false"
                  size="small"
                  @input="sheduleSave"
                />
              </td>
              <td class="p-0.5">
                <InputNumber
                  v-model="take.weight"
                  class="w-full input-number-no-arrows"
                  input-class="w-full input-number-no-arrows text-xs p-1"
                  :min="0"
                  :use-grouping="false"
                  size="small"
                  @input="sheduleSave"
                />
              </td>
              <td class="p-1">{{ formatTakeTotal(calculateTakeTotal(take.energy, take.weight)) }}</td>
              <td class="p-0.5">
                <InputText
                  v-model="take.label"
                  class="w-full"
                  size="small"
                  @input="sheduleSave"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <CalculatorControls
        @input="handleCalculatorInput"
      />

      <div
        v-if="selectedTakesIds.size"
        class="absolute z-2 w-full px-2 py-1 flex gap-4 items-center bg-surface-100 rounded-b-lg shadow-lg"
      >
        <Button
          rounded
          title="Снять выделение"
          aria-label="Снять выделение"
          @click="handleClearSelection"
        >
          <div class="i-[mdi--close] size-6" />
        </Button>

        <div class="text-lg" title="Выбрано">
          {{ selectedTakesIds.size }}
        </div>

        <div class="grow" />

        <Button
          rounded
          text
          severity="danger"
          title="Удалить выбранные"
          aria-label="Удалить выбранные"
          @click="handleDeleteSelected"
        >
          <div class="i-[mdi--trash] size-6" />
        </Button>
      </div>

      <div class="absolute z-2 bottom-0 left-0 w-full p-4 flex justify-between items-center">
        <Tag severity="info" :value="String(formatTakeTotal(takesTotalEnergy))" class="text-lg" />
        <Button rounded size="large" aria-label="Добавить запись" @click="handleAddTake">
          <div class="i-[mdi--plus] size-6" />
        </Button>
      </div>
    </div>
  </div>
</template>
