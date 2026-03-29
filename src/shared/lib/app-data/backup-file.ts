import type { AppDataBackup, AppDataBackupV1 } from '~/shared/types';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

export const serializeAppDataBackup = (backup: AppDataBackup): string => {
  return JSON.stringify(backup, null, 2);
};

export const parseAppDataBackup = (text: string): AppDataBackup => {
  const parsed: unknown = JSON.parse(text);
  if (!isRecord(parsed)) {
    throw new Error('Некорректный формат backup-файла');
  }

  if (parsed.version !== 1) {
    throw new Error(`Неподдерживаемая версия backup-файла: ${String(parsed.version)}`);
  }

  if (typeof parsed.exportedAt !== 'string') {
    throw new Error('В backup-файле отсутствует exportedAt');
  }

  const data = parsed.data;
  if (!isRecord(data)) {
    throw new Error('В backup-файле отсутствует секция data');
  }

  if (!Array.isArray(data.collections) || !Array.isArray(data.items) || !Array.isArray(data.foodTakeGroups)) {
    throw new Error('В backup-файле отсутствуют обязательные массивы данных');
  }

  return parsed as AppDataBackupV1;
};

export const buildAppDataBackupFileName = (date = new Date()) => {
  const pad = (value: number) => String(value).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const sec = pad(date.getSeconds());

  return `journal-backup-v1-${yyyy}${mm}${dd}-${hh}${min}${sec}.json`;
};
