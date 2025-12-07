import { createRouter, createWebHistory } from 'vue-router';
import CollectionCreatePage from '~/pages/CollectionCreatePage.vue';
import CollectionPage from '~/pages/CollectionPage.vue';
import CollectionsPage from '~/pages/CollectionsPage.vue';
import ItemCreatePage from '~/pages/ItemCreatePage.vue';
import ItemEditPage from '~/pages/ItemEditPage.vue';
import MainPage from '~/pages/MainPage.vue';
import { useRepositoryCollection, useRepositoryItem } from '~/repositories';
import type { CollectionPageProps, ItemCreatePageProps, ItemEditPageProps } from '~/types/pages';
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
