import type { InjectionKey } from "vue";
import type { Collection, CollectionFieldKind } from "~/types/entities";

export type PayloadCollectionCreate = {
  label: string;
  fields: Array<{
    label: string;
    kind: CollectionFieldKind;
  }>
};

export type PayloadCollectionUpdate = {
  id: string;
  label: string;
  fields: Array<{
    id: string;
    label: string;
    kind: CollectionFieldKind;
  }>
};

export type RepositoryCollection = {
  getAll: () => Promise<Collection[]>;
  getOne: (id: string) => Promise<Collection | undefined>;
  create: (data: PayloadCollectionCreate) => Promise<Collection>;
  update: (data: PayloadCollectionUpdate) => Promise<void>;
};

export const REPOSITORY_KEY_COLLECTION = Symbol('repo-collection') as InjectionKey<RepositoryCollection>;
