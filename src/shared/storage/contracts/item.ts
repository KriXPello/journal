import type { InjectionKey } from 'vue';
import type { CollectionField, Item } from '~/shared/types';

export type PayloadItemCreate = {
  collectionId: string;
  data: Record<CollectionField['id'], unknown>;
};

export type PayloadItemUpdate = {
  id: string;
  data: Record<CollectionField['id'], unknown>;
};

export type RepositoryItem = {
  getAll: () => Promise<Item[]>;
  getOne: (id: string) => Promise<Item | undefined>;
  create: (data: PayloadItemCreate) => Promise<Item>;
  update: (data: PayloadItemUpdate) => Promise<Item>;
  remove: (id: string) => Promise<void>;
};

export const REPOSITORY_KEY_ITEM = Symbol('repo-item') as InjectionKey<RepositoryItem>;
