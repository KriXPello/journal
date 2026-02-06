import { ref } from 'vue';

/**
 * Хелпер для асинхронных задач с управлением isLoading и error.
 *
 * run вызывает переданную функцию:
 * - контролирует состояние загрузки
 * - отлавливает и сохраняет ошибку
 * - предотвращает race condition (только последний результат может вернуть значение)
 *
 * @example
 * const [run, isLoading, error] = useLoadingTask();
 * const result = await run(() => repo.getData(id));
 */
export const useAsyncTask = () => {
  const isLoading = ref(false);
  const error = ref<unknown>(null);
  let lastRequestId = 0;

  const run = async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
    isLoading.value = true;
    error.value = null;
    const requestId = ++lastRequestId;

    try {
      const result = await fn();
      if (requestId !== lastRequestId) return undefined;
      return result;
    } catch (err) {
      if (requestId !== lastRequestId) return undefined;
      error.value = err;
      return undefined;
    } finally {
      if (requestId === lastRequestId) {
        isLoading.value = false;
      }
    }
  };

  return [run, isLoading, error] as const;
};