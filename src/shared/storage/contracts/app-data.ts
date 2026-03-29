import type { InjectionKey } from 'vue';
import type { AppDataBackup } from '~/shared/types';

export type BackupImportSummary = {
  collections: number;
  items: number;
  foodTakeGroups: number;
};

export type RepositoryAppData = {
  exportBackup: () => Promise<AppDataBackup>;
  importBackup: (backup: AppDataBackup) => Promise<BackupImportSummary>;
  clearAll: () => Promise<void>;
};

export const REPOSITORY_KEY_APP_DATA = Symbol('repo-app-data') as InjectionKey<RepositoryAppData>;
