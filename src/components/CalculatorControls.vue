<script setup lang="ts">
import CalculatorButton from '~/components/CalculatorButton.vue';
import type { CalculatorInputValue } from '~/types/entities';

const emit = defineEmits<{
  input: [value: CalculatorInputValue];
}>();

const handleClick = (value: CalculatorInputValue) => {
  emit('input', value);
};

</script>

<template>
  <div class="calculator-controls">
    <CalculatorButton @click="handleClick('clear')">C</CalculatorButton>
    <CalculatorButton @click="handleClick('back')">🠔</CalculatorButton>
    <div></div>
    <CalculatorButton @click="handleClick('/')">÷</CalculatorButton>

    <CalculatorButton @click="handleClick('7')">7</CalculatorButton>
    <CalculatorButton @click="handleClick('8')">8</CalculatorButton>
    <CalculatorButton @click="handleClick('9')">9</CalculatorButton>
    <CalculatorButton @click="handleClick('*')">×</CalculatorButton>

    <CalculatorButton @click="handleClick('4')">4</CalculatorButton>
    <CalculatorButton @click="handleClick('5')">5</CalculatorButton>
    <CalculatorButton @click="handleClick('6')">6</CalculatorButton>
    <CalculatorButton @click="handleClick('-')">-</CalculatorButton>

    <CalculatorButton @click="handleClick('1')">1</CalculatorButton>
    <CalculatorButton @click="handleClick('2')">2</CalculatorButton>
    <CalculatorButton @click="handleClick('3')">3</CalculatorButton>
    <CalculatorButton @click="handleClick('+')">-</CalculatorButton>

    <div></div>
    <CalculatorButton @click="handleClick('0')">1</CalculatorButton>
    <CalculatorButton @click="handleClick('.')">.</CalculatorButton>
    <div></div>
  </div>
</template>

<style scoped>
.calculator-controls {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.cell {
  aspect-ratio: 1;
}

</style>