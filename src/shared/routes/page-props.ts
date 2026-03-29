import type { Collection, Item } from '~/shared/types';

export type CollectionPageProps = {
  collection: Collection;
};

export type CollectionEditPageProps = {
  collection: Collection;
};

export type ItemCreatePageProps = {
  collection: Collection;
};

export type ItemEditPageProps = {
  collection: Collection;
  item: Item;
};
