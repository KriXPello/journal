<script setup lang="ts">
import CalculatorButton from './CalculatorButton.vue';
import type { CalculatorInputValue } from '../model/calculator';

const emit = defineEmits<{
  input: [value: CalculatorInputValue];
}>();

const handleClick = (value: CalculatorInputValue) => {
  emit('input', value);
};

</script>

<template>
  <div class="calculator-controls">
    <CalculatorButton class="cell" @click="handleClick('clear')">C</CalculatorButton>
    <CalculatorButton class="cell" @click="handleClick('back')">🠔</CalculatorButton>
    <div class="cell"></div>
    <CalculatorButton class="cell" @click="handleClick('/')">÷</CalculatorButton>

    <CalculatorButton class="cell" @click="handleClick(7)">7</CalculatorButton>
    <CalculatorButton class="cell" @click="handleClick(8)">8</CalculatorButton>
    <CalculatorButton class="cell" @click="handleClick(9)">9</CalculatorButton>
    <CalculatorButton class="cell" @click="handleClick('*')">×</CalculatorButton>

    <CalculatorButton class="cell" @click="handleClick(4)">4</CalculatorButton>
    <CalculatorButton class="cell" @click="handleClick(5)">5</CalculatorButton>
    <CalculatorButton class="cell" @click="handleClick(6)">6</CalculatorButton>
    <CalculatorButton class="cell" @click="handleClick('-')">-</CalculatorButton>

    <CalculatorButton class="cell" @click="handleClick(1)">1</CalculatorButton>
    <CalculatorButton class="cell" @click="handleClick(2)">2</CalculatorButton>
    <CalculatorButton class="cell" @click="handleClick(3)">3</CalculatorButton>
    <CalculatorButton class="cell" @click="handleClick('+')">+</CalculatorButton>

    <div class="cell"></div>
    <CalculatorButton class="cell" @click="handleClick(0)">1</CalculatorButton>
    <CalculatorButton class="cell" @click="handleClick('.')">.</CalculatorButton>
    <div class="cell"></div>
  </div>
</template>

<style scoped>
.calculator-controls {
  container-type: block-size;
  display: grid;
  grid-template-columns: repeat(4, auto);
  grid-template-rows: repeat(5, 1fr);
  justify-content: center;
  justify-items: stretch;
  gap: 16px;
}

.cell {
  display: block;
  width: auto;
  height: 100%;
  aspect-ratio: 1 / 1;
  font-size: 2rem;
  font-size: 4cqh;
}

</style>