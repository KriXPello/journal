import { getRepositories } from './instance';

export const useRepositoryAppData = () => getRepositories().appData;
export const useRepositoryItem = () => getRepositories().item;
export const useRepositoryCollection = () => getRepositories().collection;
export const useRepositoryFoodTake = () => getRepositories().foodTake;

export * from './contracts';
export * from './indexeddb';
export * from './instance';
