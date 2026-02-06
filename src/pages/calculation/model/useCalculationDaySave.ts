import { toRaw } from 'vue';
import { useRepositoryCalculationDay } from '~/repositories';
import { useAsyncTask } from '~/shared/lib/task';
import { type CalculationDay } from '~/types/entities';

export const useCalculationDaySave = () => {
  const [run, isLoading, error] = useAsyncTask();

  const repo = useRepositoryCalculationDay();

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

  const saveCalculationDay = async (data: CalculationDay) => {
    const result = await run(() => repo.createOrUpdate({
      date: data.date,
      calculations: data.calculations,
    }));
    return result;
  };

  const debounceTimeoutByDate = new Map<string, number>();
  const saveWithDebounce = () => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };

  return {
    isLoading,
    error,
    saveCalculationDay,
  };
};