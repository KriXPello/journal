import { computed } from 'vue';
import { injectLoading } from './context';

export const useLoading = (loadingCounter = injectLoading()) => {
  const startLoading = () => {
    loadingCounter.value++;
  };

  const endLoading = () => {
    loadingCounter.value = Math.max(0, loadingCounter.value - 1);
  };

  return {
    startLoading,
    endLoading,
    isLoading: computed(() => loadingCounter.value > 0),
  };
};
