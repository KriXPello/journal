import { createApp } from 'vue';
import { createPinia } from 'pinia';

import '~/assets/tailwind.css';
import '~/assets/main.css';

import App from './App.vue';
import router from './router';
import { createIndexedDbRepositories } from '~/repositories/indexeddb';
import { REPOSITORY_KEY_ITEM } from '~/types/repositories/item';
import { REPOSITORY_KEY_COLLECTION } from '~/types/repositories/collection';

const initApp = async () => {
  const app = createApp(App);

  const repos = await createIndexedDbRepositories();

  app.provide(REPOSITORY_KEY_ITEM, repos.item);
  app.provide(REPOSITORY_KEY_COLLECTION, repos.collection);

  app.use(createPinia());
  app.use(router);

  app.mount('#app');
};

initApp();
