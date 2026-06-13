import { createRouter, createWebHistory } from 'vue-router';
import type {
  CollectionEditPageProps,
  CollectionPageProps,
  ItemCreatePageProps,
  ItemEditPageProps,
} from '~/shared/routes';
import CaloriesPage from '~/pages/calories/ui/CaloriesPage.vue';
import CollectionCreatePage from '~/pages/collections/ui/CollectionCreatePage.vue';
import CollectionEditPage from '~/pages/collections/ui/CollectionEditPage.vue';
import CollectionPage from '~/pages/collections/ui/CollectionPage.vue';
import CollectionsPage from '~/pages/collections/ui/CollectionsPage.vue';
import ItemCreatePage from '~/pages/collections/ui/ItemCreatePage.vue';
import ItemEditPage from '~/pages/collections/ui/ItemEditPage.vue';
import SettingsPage from '~/pages/settings/ui/SettingsPage.vue';
import { RouteName } from '~/shared/routes';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: RouteName.Main,
      redirect: { name: RouteName.Collections },
      // component: CaloriesPage,
    },
    {
      path: '/settings',
      name: RouteName.Settings,
      component: SettingsPage,
    },
    {
      path: '/collections',
      children: [
        {
          path: '',
          name: RouteName.Collections,
          component: CollectionsPage,
        },
        {
          path: 'create',
          name: RouteName.CollectionCreate,
          component: CollectionCreatePage,
        },
      ],
    },
    {
      path: '/collections/:collectionId',
      children: [
        {
          path: '',
          name: RouteName.Collection,
          component: CollectionPage,
          props: (route): CollectionPageProps => ({
            collectionId: route.params.collectionId as string,
          }),
        },
        {
          path: 'edit',
          name: RouteName.CollectionEdit,
          component: CollectionEditPage,
          props: (route): CollectionEditPageProps => ({
            collectionId: route.params.collectionId as string,
          }),
        },
        {
          path: 'items/create',
          name: RouteName.ItemCreate,
          component: ItemCreatePage,
          props: (route): ItemCreatePageProps => ({
            collectionId: route.params.collectionId as string,
          }),
        },
        {
          path: 'items/:itemId/edit',
          name: RouteName.ItemEdit,
          component: ItemEditPage,
          props: (route): ItemEditPageProps => ({
            collectionId: route.params.collectionId as string,
            itemId: route.params.itemId as string,
          }),
        },
      ],
    },
  ],
});

export default router;
