import { ref } from 'vue';
import { useRepositoryCalculationDay } from '~/repositories';
import { useAsyncTask } from '~/shared/lib/task';
import { type CalculationDay, DateObject } from '~/types/entities';

export const useCalculationDay = () => {
  const calculationDay = ref<CalculationDay | null>(null);
  const [run, isLoading, error] = useAsyncTask();

  const repo = useRepositoryCalculationDay();

  const loadCalculationDay = async (date: Date) => {
    const dateObject = DateObject.fromDate(date);
    const result = await run(() => repo.getByDate(dateObject));
    if (result == undefined) {
      return;
    }
    calculationDay.value = result;
  };

  return {
    calculationDay,
    isLoading,
    error,
    loadCalculationDay,
  };
};