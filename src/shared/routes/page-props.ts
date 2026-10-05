export type CollectionPageProps = {
  collectionId: string;
  groupId?: string;
};

export type CollectionEditPageProps = {
  collectionId: string;
};

export type ItemCreatePageProps = {
  collectionId: string;
  groupId: string | null;
};

export type ItemEditPageProps = {
  collectionId: string;
  itemId: string;
};
