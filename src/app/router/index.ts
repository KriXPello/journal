import { createRouter, createWebHistory } from 'vue-router';
import type { CollectionEditPageProps, CollectionPageProps, ItemCreatePageProps, ItemEditPageProps } from '~/shared/routes';
import CaloriesPage from '~/pages/calories/ui/CaloriesPage.vue';
import CollectionCreatePage from '~/pages/collections/ui/CollectionCreatePage.vue';
import CollectionEditPage from '~/pages/collections/ui/CollectionEditPage.vue';
import CollectionPage from '~/pages/collections/ui/CollectionPage.vue';
import CollectionsPage from '~/pages/collections/ui/CollectionsPage.vue';
import ItemCreatePage from '~/pages/collections/ui/ItemCreatePage.vue';
import ItemEditPage from '~/pages/collections/ui/ItemEditPage.vue';
import SettingsPage from '~/pages/settings/ui/SettingsPage.vue';
import { useRepositoryCollection, useRepositoryItem } from '~/shared/storage';
import { RouteName } from '~/shared/routes';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: RouteName.Main,
      component: CaloriesPage,
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
          props: (to) => to.meta.data,
          beforeEnter: async (to) => {
            const repoCollection = useRepositoryCollection();
            const collection = await repoCollection.getOne(to.params.collectionId as string);
            if (collection == undefined) {
              // TODO: log
              return { name: RouteName.Collections };
            }
            const props: CollectionPageProps = {
              collection,
            };
            to.meta.data = props;
          },
        },
        {
          path: 'edit',
          name: RouteName.CollectionEdit,
          component: CollectionEditPage,
          props: (to) => to.meta.data,
          beforeEnter: async (to) => {
            const repoCollection = useRepositoryCollection();
            const collection = await repoCollection.getOne(to.params.collectionId as string);
            if (collection == undefined) {
              // TODO: log
              return { name: RouteName.Collections };
            }
            const props: CollectionEditPageProps = {
              collection,
            };
            to.meta.data = props;
          },
        },
        {
          path: 'items/create',
          name: RouteName.ItemCreate,
          component: ItemCreatePage,
          props: (to) => to.meta.data,
          beforeEnter: async (to) => {
            const repoCollection = useRepositoryCollection();
            const collection = await repoCollection.getOne(to.params.collectionId as string);
            if (collection == undefined) {
              // TODO: log
              return { name: RouteName.Collection };
            }
            const props: ItemCreatePageProps = {
              collection,
            };
            to.meta.data = props;
          },
        },
        {
          path: 'items/:itemId/edit',
          name: RouteName.ItemEdit,
          component: ItemEditPage,
          props: (to) => to.meta.data,
          beforeEnter: async (to) => {
            const repoCollection = useRepositoryCollection();
            const repoItem = useRepositoryItem();
            const [collection, item] = await Promise.all([
              repoCollection.getOne(to.params.collectionId as string),
              repoItem.getOne(to.params.itemId as string),
            ]);
            if (collection == undefined || item == undefined) {
              // TODO: log
              return { name: RouteName.Collection };
            }
            const props: ItemEditPageProps = {
              collection,
              item,
            };
            to.meta.data = props;
          },
        },
      ],
    },
  ],
});

export default router;
