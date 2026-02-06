import { inject, type InjectionKey, type Ref } from 'vue';

type LoadingCounter = Ref<number>;

export const INJECT_LOADING_COUNTER_KEY = Symbol('loading') as InjectionKey<LoadingCounter>;

export const injectLoading = (): LoadingCounter => {
  const counter = inject(INJECT_LOADING_COUNTER_KEY);
  if (counter == undefined) {
    throw new Error('LOADING_COUNTER_KEY не найден');
  }
  return counter;
};