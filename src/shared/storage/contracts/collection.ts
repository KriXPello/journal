import type { Collection, CollectionFieldKind } from '~/shared/types';

export type PayloadCollectionCreate = {
  label: string;
  fields: Array<{
    label: string;
    kind: CollectionFieldKind;
    suggestValue: boolean;
  }>
};

export type PayloadCollectionUpdate = {
  id: string;
  label: string;
  fields: Array<{
    id: string;
    label: string;
    kind: CollectionFieldKind;
    suggestValue: boolean;
  }>
};

export type RepositoryCollection = {
  getAll: () => Promise<Collection[]>;
  getOne: (id: string) => Promise<Collection | undefined>;
  create: (data: PayloadCollectionCreate) => Promise<Collection>;
  update: (data: PayloadCollectionUpdate) => Promise<Collection>;
  remove: (id: string) => Promise<void>;
};
