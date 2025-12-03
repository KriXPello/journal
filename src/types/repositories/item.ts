import type { InjectionKey } from "vue";
import type { Item, CollectionField } from "~/types/entities";

export type PayloadItemCreate = {
  name: string;
  collectionId: string;
  data: Record<CollectionField['id'], unknown>;
};

export type PayloadItemUpdate = {
  id: string;
  name: string;
  data: Record<CollectionField['id'], unknown>;
};

export type RepositoryItem = {
  getAll: () => Promise<Item[]>;
  create: (data: PayloadItemCreate) => Promise<Item>;
  update: (data: PayloadItemUpdate) => Promise<void>;
};

export const REPOSITORY_KEY_ITEM = Symbol('repo-item') as InjectionKey<RepositoryItem>;
