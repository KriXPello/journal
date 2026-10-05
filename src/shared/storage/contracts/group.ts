import type { CollectionGroup } from '~/shared/types';

export type GroupRepository = {
  getCollectionGroups: (payload: { collectionId: string }) => Promise<CollectionGroup[]>;
  create: (payload: { collectionId: string; parentId: string | null; label: string }) => Promise<CollectionGroup>;
  update: (payload: { id: string; label: string }) => Promise<CollectionGroup>;
  move: (payload: { id: string; parentId: string | null }) => Promise<CollectionGroup>;
  remove: (id: string) => Promise<void>;
};
