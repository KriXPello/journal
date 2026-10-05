import type { CollectionField, Item } from '~/shared/types';

export type CreateItemPayload = {
  collectionId: string;
  groupId: string | null;
  data: Record<CollectionField['id'], unknown>;
};

export type UpdateItemPayload = {
  id: string;
  data: Record<CollectionField['id'], unknown>;
};

export type GetCollectionItemsPayload = {
  collectionId: string;
};

export type ItemBatchPayload = {
  collectionId: string;
  ids: string[];
};

export type ItemRepository = {
  getCollectionItems: (data: GetCollectionItemsPayload) => Promise<Item[]>;
  getOne: (id: string) => Promise<Item | undefined>;
  create: (data: CreateItemPayload) => Promise<Item>;
  update: (data: UpdateItemPayload) => Promise<Item>;
  remove: (id: string) => Promise<void>;
  move: (data: { id: string; groupId: string | null }) => Promise<Item>;
  removeMany: (payload: ItemBatchPayload) => Promise<void>;
  moveMany: (payload: ItemBatchPayload & { groupId: string | null }) => Promise<void>;
};
