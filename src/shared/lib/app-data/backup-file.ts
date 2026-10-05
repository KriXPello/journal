import type { AppDataBackup } from '~/shared/types';

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

  if (parsed.version !== 1 && parsed.version !== 2) {
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

  if (parsed.version === 2 && !Array.isArray(data.groups)) {
    throw new Error('В backup-файле отсутствует массив групп');
  }

  return parsed as AppDataBackup;
};

export const buildAppDataBackupFileName = (date = new Date()) => {
  const pad = (value: number) => String(value).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const sec = pad(date.getSeconds());

  return `journal-backup-v2-${yyyy}${mm}${dd}-${hh}${min}${sec}.json`;
};
