export const QUERY_KEYS = {
  collectionRoot: ['collection'] as const,
  collectionItems: (collectionId: string) => [...QUERY_KEYS.collectionRoot, collectionId] as const,
};
