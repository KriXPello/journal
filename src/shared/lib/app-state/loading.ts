import { computed, ref } from 'vue';

const loadingCounter = ref(0);

export const useLoadingStore = () => {
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
