import { defineMutationOptions } from '@pinia/colada';
import type { AppDataBackup } from '~/shared/types';
import { invalidateAllAppData } from '~/shared/query/invalidate';
import { getRepositories } from '~/shared/storage/instance';

export const exportBackupMutation = defineMutationOptions({
  mutation: () => getRepositories().appData.exportBackup(),
});

export const importBackupMutation = defineMutationOptions({
  mutation: (backup: AppDataBackup) =>
    getRepositories().appData.importBackup(backup),
  onSuccess: () => {
    invalidateAllAppData();
  },
});

export const clearAllAppDataMutation = defineMutationOptions({
  mutation: () => getRepositories().appData.clearAll(),
  onSuccess: () => {
    invalidateAllAppData();
  },
});
