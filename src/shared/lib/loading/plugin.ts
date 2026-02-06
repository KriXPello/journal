import { ref, type Plugin } from 'vue';
import { INJECT_LOADING_COUNTER_KEY } from './context';

export const appLoadingPlugin: Plugin = {
  install(app) {
    app.provide(INJECT_LOADING_COUNTER_KEY, ref(0));
  },
};

