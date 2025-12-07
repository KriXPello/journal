import type { Collection, Item } from '~/types/entities';

export type CollectionPageProps = {
  collection: Collection;
};

export type ItemCreatePageProps = {
  collection: Collection;
};

export type ItemEditPageProps = {
  collection: Collection;
  item: Item;
};