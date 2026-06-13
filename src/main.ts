import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { createApp } from 'vue';

import '@vuepic/vue-datepicker/dist/main.css';
import '~/app/styles/main.css';
import '~/app/styles/tailwind.css';

import { piniaColadaConfig } from '~/app/colada';
import { AppPreset } from '~/app/theme/preset';

import { PiniaColada } from '@pinia/colada';
import App from '~/app/App.vue';
import router from '~/app/router';
import { createIndexedDbRepositories } from '~/shared/storage';
import { setRepositories } from '~/shared/storage/instance';


const initApp = async () => {
  const app = createApp(App);

  setRepositories(await createIndexedDbRepositories());

  app.use(PrimeVue, {
    theme: {
      preset: AppPreset,
      options: {
        darkModeSelector: 'system',
      },
    },
  });
  app.use(ToastService);
  app.use(ConfirmationService);
  app.use(createPinia());
  app.use(PiniaColada, piniaColadaConfig);
  app.use(router);

  app.mount('#app');
};

initApp();
