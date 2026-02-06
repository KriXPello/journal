import { type MaybeRefOrGetter, toValue, watch, onScopeDispose } from 'vue';
import { useLoading } from './useLoading';
import { injectLoading } from './context';

export const useBindLoading = (
  loading: MaybeRefOrGetter<boolean>,
  counter = injectLoading(),
) => {
  const { startLoading, endLoading } = useLoading(counter);

  let isActive = toValue(loading);
  if (isActive) {
    startLoading();
  }

  const watcher = watch(() => toValue(loading), (newValue) => {
    if (isActive && !newValue) {
      isActive = false;
      endLoading();
    } else if (!isActive && newValue) {
      isActive = true;
      startLoading();
    }
  }, { flush: 'sync' });

  onScopeDispose(() => {
    watcher.stop();
    if (isActive) {
      endLoading();
    }
  });
};