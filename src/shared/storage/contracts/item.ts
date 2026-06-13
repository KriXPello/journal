import type { InjectionKey } from 'vue';
import type { CollectionField, Item } from '~/shared/types';

export type CreateItemPayload = {
  collectionId: string;
  data: Record<CollectionField['id'], unknown>;
};

export type UpdateItemPayload = {
  id: string;
  data: Record<CollectionField['id'], unknown>;
};

export type GetCollectionItemsPayload = {
  collectionId: string;
};

export type ItemRepository = {
  getCollectionItems: (data: GetCollectionItemsPayload) => Promise<Item[]>;
  getOne: (id: string) => Promise<Item | undefined>;
  create: (data: CreateItemPayload) => Promise<Item>;
  update: (data: UpdateItemPayload) => Promise<Item>;
  remove: (id: string) => Promise<void>;
};

export const ITEM_REPOSITORY_KEY = Symbol('repo-item') as InjectionKey<ItemRepository>;
