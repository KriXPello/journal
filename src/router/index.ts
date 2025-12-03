import { createRouter, createWebHistory } from 'vue-router';
import CollectionsPage from '~/pages/CollectionsPage.vue';
import CollectionCreatePage from '~/pages/CollectionCreatePage.vue';
import MainPage from '~/pages/MainPage.vue';
import { RouteName } from '~/types/routes';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: RouteName.Main,
      component: MainPage,
    },
    {
      path: '/collections',
      name: RouteName.Collections,
      component: CollectionsPage,
    },
    {
      path: '/collections/create',
      name: RouteName.CollectionCreate,
      component: CollectionCreatePage,
    },
  ],
});

export default router;
