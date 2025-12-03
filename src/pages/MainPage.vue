<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef } from 'vue';
import type { FoodTake } from '~/types/entities';
import { vLongPress } from '~/directives/long-press';
import { onLongPress } from '@vueuse/core';
import PageHeader from '~/components/PageHeader.vue';

const takes = ref<FoodTake[]>([]);

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
  (acc, x) => acc + calculateTakeTotal(x.energy || 0, x.weight || 0), 0)
);

const handleAddTake = () => {
  const take: FoodTake = {
    id: String(Date.now()) + Math.random(),
    dateISO: new Date().toISOString(),
    energy: 0,
    weight: 100,
    label: '',
  };

  takes.value.push(take);
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
  }
};
</script>

<template>
  <div class="size-full flex flex-col items-center">
    <div class="size-full max-w-xl relative flex flex-col">
      <PageHeader>Калькулятор калорий</PageHeader>
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
                >
              </td>
              <td>
                <input
                  v-model.number="take.weight"
                  type="number"
                  class="input input-xs input-number-no-arrows select-auto"
                  min="0"
                >
              </td>
              <td>{{ formatTakeTotal(calculateTakeTotal(take.energy, take.weight)) }}</td>
              <td>
                <input
                  v-model="take.label"
                  type="text"
                  class="input input-xs select-auto"
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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
