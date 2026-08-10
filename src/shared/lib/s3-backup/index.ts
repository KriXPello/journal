import { HeadBucketCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { useLocalStorage } from '@vueuse/core';
import { buildAppDataBackupFileName, serializeAppDataBackup } from '~/shared/lib/app-data';
import { getRepositories } from '~/shared/storage/instance';

const SETTINGS_STORAGE_KEY = 'journal:s3-backup-settings';
const SYNC_STATE_STORAGE_KEY = 'journal:s3-backup-sync-state';
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export type S3BackupSettings = {
  enabled: boolean;
  endpoint: string;
  region: string;
  bucket: string;
  prefix: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
};

export type S3BackupSyncState = {
  lastSuccessAt?: string;
  lastAttemptAt?: string;
  lastError?: string;
};

const defaultSettings = (): S3BackupSettings => ({
  enabled: true,
  endpoint: '',
  region: 'ru-central-1',
  bucket: '',
  prefix: 'journal-backups',
  accessKeyId: '',
  secretAccessKey: '',
  forcePathStyle: true,
});

const s3BackupSettings = useLocalStorage<S3BackupSettings>(SETTINGS_STORAGE_KEY, defaultSettings(), {
  mergeDefaults: true,
  flush: 'sync',
});
const s3BackupSyncState = useLocalStorage<S3BackupSyncState>(SYNC_STATE_STORAGE_KEY, {}, { flush: 'sync' });

export const useS3BackupSettings = () => s3BackupSettings;
export const useS3BackupSyncState = () => s3BackupSyncState;

const hasRequiredSettings = (settings: S3BackupSettings) => {
  return Boolean(settings.endpoint.trim()
    && settings.bucket.trim()
    && settings.accessKeyId.trim()
    && settings.secretAccessKey.trim());
};

const validateSettings = (settings: S3BackupSettings) => {
  if (!settings.endpoint.trim()) throw new Error('Укажите endpoint S3-хранилища');
  if (!settings.bucket.trim()) throw new Error('Укажите имя bucket');
  if (!settings.accessKeyId.trim() || !settings.secretAccessKey.trim()) {
    throw new Error('Укажите Access Key ID и Secret Access Key');
  }
};

const createS3Client = (settings: S3BackupSettings) => {
  return new S3Client({
    endpoint: settings.endpoint.trim(),
    region: settings.region.trim() || 'us-east-1',
    forcePathStyle: settings.forcePathStyle,
    credentials: {
      accessKeyId: settings.accessKeyId.trim(),
      secretAccessKey: settings.secretAccessKey.trim(),
    },
  });
};

const getObjectKey = (prefix: string, fileName: string) => {
  const normalizedPrefix = prefix.trim().replace(/^\/+|\/+$/g, '');
  return normalizedPrefix ? `${normalizedPrefix}/${fileName}` : fileName;
};

const recordAttempt = (error?: unknown) => {
  const state: S3BackupSyncState = {
    ...s3BackupSyncState.value,
    lastAttemptAt: new Date().toISOString(),
    lastError: error ? String(error) : undefined,
  };
  s3BackupSyncState.value = state;
  return state;
};

export const checkS3BackupConnection = async (settings = s3BackupSettings.value) => {
  validateSettings(settings);
  try {
    await createS3Client(settings).send(new HeadBucketCommand({ Bucket: settings.bucket.trim() }));
    recordAttempt();
  } catch (error) {
    recordAttempt(error);
    throw error;
  }
};

export const uploadS3Backup = async (settings = s3BackupSettings.value) => {
  validateSettings(settings);
  try {
    const backup = await getRepositories().appData.exportBackup();
    const fileName = buildAppDataBackupFileName(new Date(backup.exportedAt));
    const key = getObjectKey(settings.prefix, fileName);
    await createS3Client(settings).send(new PutObjectCommand({
      Bucket: settings.bucket.trim(),
      Key: key,
      Body: serializeAppDataBackup(backup),
      ContentType: 'application/json',
    }));
    const state: S3BackupSyncState = {
      lastSuccessAt: new Date().toISOString(),
      lastAttemptAt: new Date().toISOString(),
    };
    s3BackupSyncState.value = state;
    return { key, state };
  } catch (error) {
    recordAttempt(error);
    throw error;
  }
};

export const runScheduledS3Backup = async () => {
  const settings = s3BackupSettings.value;
  if (!settings.enabled || !hasRequiredSettings(settings)) return { attempted: false };

  const { lastSuccessAt } = s3BackupSyncState.value;
  if (lastSuccessAt && Date.now() - Date.parse(lastSuccessAt) < DAY_IN_MS) {
    return { attempted: false };
  }

  await uploadS3Backup(settings);
  return { attempted: true };
};
