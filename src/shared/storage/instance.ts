import type { createIndexedDbRepositories } from '~/shared/storage/indexeddb';

type Repositories = Awaited<ReturnType<typeof createIndexedDbRepositories>>;

let repositories: Repositories | null = null;

export const setRepositories = (value: Repositories) => {
  repositories = value;
};

export const getRepositories = (): Repositories => {
  if (!repositories) {
    throw new Error('Repositories not initialized');
  }
  return repositories;
};
