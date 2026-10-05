import type { AppDataBackup, AppDataBackupV2 } from '~/shared/types';

export type BackupImportSummary = {
  collections: number;
  items: number;
  foodTakeGroups: number;
  groups: number;
};

export type RepositoryAppData = {
  exportBackup: () => Promise<AppDataBackupV2>;
  importBackup: (backup: AppDataBackup) => Promise<BackupImportSummary>;
  clearAll: () => Promise<void>;
};
