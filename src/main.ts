import { createPinia } from 'pinia';
import { createApp } from 'vue';

import '@vuepic/vue-datepicker/dist/main.css';
import '~/app/styles/main.css';
import '~/app/styles/tailwind.css';

import { piniaColadaConfig } from '~/app/colada';

import App from '~/app/App.vue';
import router from '~/app/router';
import {
  createIndexedDbRepositories,
  REPOSITORY_KEY_APP_DATA,
  REPOSITORY_KEY_COLLECTION,
  REPOSITORY_KEY_FOOD_TAKE,
  REPOSITORY_KEY_ITEM,
} from '~/shared/storage';
import { PiniaColada } from '@pinia/colada';


const initApp = async () => {
  const app = createApp(App);

  const repos = await createIndexedDbRepositories();

  app.provide(REPOSITORY_KEY_APP_DATA, repos.appData);
  app.provide(REPOSITORY_KEY_ITEM, repos.item);
  app.provide(REPOSITORY_KEY_COLLECTION, repos.collection);
  app.provide(REPOSITORY_KEY_FOOD_TAKE, repos.foodTake);

  app.use(createPinia());
  app.use(PiniaColada, piniaColadaConfig);
  app.use(router);

  app.mount('#app');
};

initApp();
