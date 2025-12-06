import { createRouter, createWebHistory } from 'vue-router';
import CollectionCreatePage from '~/pages/CollectionCreatePage.vue';
import CollectionPage from '~/pages/CollectionPage.vue';
import CollectionsPage from '~/pages/CollectionsPage.vue';
import MainPage from '~/pages/MainPage.vue';
import { useRepositoryCollection } from '~/repositories';
import type { CollectionPageProps } from '~/types/pages';
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
      path: '/collections/:id',
      name: RouteName.Collection,
      component: CollectionPage,
      props: (to) => to.meta.data,
      beforeEnter: async (to) => {
        const repoCollections = useRepositoryCollection();
        const collection = await repoCollections.getOne(to.params.id as string);
        if (collection == undefined) {
          return { name: RouteName.Collections };
        }
        const props: CollectionPageProps = {
          collection: collection, 
        };
        to.meta.data = props;
      }
    },
    {
      path: '/collections/create',
      name: RouteName.CollectionCreate,
      component: CollectionCreatePage,
    },
  ],
});

export default router;
