import { createPinia } from 'pinia';
import { createApp } from 'vue';

import '@vuepic/vue-datepicker/dist/main.css';
import '~/assets/main.css';
import '~/assets/tailwind.css';

import { createIndexedDbRepositories } from '~/repositories/indexeddb';
import { REPOSITORY_KEY_COLLECTION } from '~/types/repositories/collection';
import { REPOSITORY_KEY_CALCULATION_DAY } from '~/types/repositories/calculation-day';
import { REPOSITORY_KEY_ITEM } from '~/types/repositories/item';
import App from './App.vue';
import router from './router';
import { appLoadingPlugin } from '~/shared/lib/loading';

const initApp = async () => {
  const app = createApp(App);

  const repos = await createIndexedDbRepositories();

  app.provide(REPOSITORY_KEY_ITEM, repos.item);
  app.provide(REPOSITORY_KEY_COLLECTION, repos.collection);
  app.provide(REPOSITORY_KEY_CALCULATION_DAY, repos.foodTake);

  app.use(appLoadingPlugin);
  app.use(createPinia());
  app.use(router);

  app.mount('#app');
};

initApp();
