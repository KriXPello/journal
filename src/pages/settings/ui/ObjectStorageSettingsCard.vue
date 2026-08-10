<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core';
import Button from 'primevue/button';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import ToggleSwitch from 'primevue/toggleswitch';
import { computed, ref } from 'vue';
import { useAppNotify } from '~/shared/lib/interaction';
import {
  checkS3BackupConnection,
  uploadS3Backup,
  useS3BackupSettings,
  useS3BackupSyncState,
} from '~/shared/lib/s3-backup';
const { showError, showSuccess } = useAppNotify();


const s3Settings = useS3BackupSettings();
const s3SyncState = useS3BackupSyncState();
const isCheckingS3 = ref(false);
const isSyncingS3 = ref(false);

const s3Status = computed(() => {
  if (s3SyncState.value.lastError) {
    return `Последняя ошибка: ${s3SyncState.value.lastError}`;
  }
  if (s3SyncState.value.lastSuccessAt) {
    return `Последняя выгрузка: ${new Date(s3SyncState.value.lastSuccessAt).toLocaleString()}`;
  }
  return 'Выгрузок в S3 ещё не было.';
});

const handleS3Check = async () => {
  isCheckingS3.value = true;
  try {
    await checkS3BackupConnection(s3Settings.value);
    showSuccess('Подключение к S3 успешно проверено.');
  } catch (error) {
    showError('Не удалось подключиться к S3: ' + String(error));
  } finally {
    isCheckingS3.value = false;
  }
};

const handleS3Sync = async () => {
  isSyncingS3.value = true;
  try {
    const { key } = await uploadS3Backup(s3Settings.value);
    showSuccess(`Резервная копия загружена: ${key}`);
  } catch (error) {
    showError('Не удалось выгрузить резервную копию: ' + String(error));
  } finally {
    isSyncingS3.value = false;
  }
};
</script>

<template>
  <Card class="bg-surface-100">
    <template #title>
      Автоматический бэкап в S3
    </template>
    <template #content>
      <p class="mb-4">
        Резервное копирование будет выполняться не чаще чем раз в 24 часа.
      </p>
      <div class="flex items-center justify-between mb-4">
        <label for="s3-enabled">Включить автоматическую выгрузку</label>
        <ToggleSwitch id="s3-enabled" v-model="s3Settings.enabled" />
      </div>
      <div class="grid gap-3">
        <div>
          <label class="block text-sm mb-1" for="s3-endpoint">Endpoint</label>
          <InputText id="s3-endpoint" v-model="s3Settings.endpoint" class="w-full" placeholder="https://s3.example.com" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm mb-1" for="s3-region">Region</label>
            <InputText id="s3-region" v-model="s3Settings.region" class="w-full" />
          </div>
          <div>
            <label class="block text-sm mb-1" for="s3-bucket">Bucket</label>
            <InputText id="s3-bucket" v-model="s3Settings.bucket" class="w-full" />
          </div>
        </div>
        <div>
          <label class="block text-sm mb-1" for="s3-prefix">Папка в bucket</label>
          <InputText id="s3-prefix" v-model="s3Settings.prefix" class="w-full" placeholder="journal-backups" />
        </div>
        <div>
          <label class="block text-sm mb-1" for="s3-access-key">Access Key ID</label>
          <InputText id="s3-access-key" v-model="s3Settings.accessKeyId" class="w-full" autocomplete="off" />
        </div>
        <div>
          <label class="block text-sm mb-1" for="s3-secret-key">Secret Access Key</label>
          <Password
            id="s3-secret-key"
            v-model="s3Settings.secretAccessKey"
            class="w-full"
            input-class="w-full"
            :feedback="false"
            toggle-mask
            autocomplete="off"
          />
        </div>
        <div class="flex items-center justify-between">
          <label for="s3-path-style">Использовать path-style URL</label>
          <ToggleSwitch id="s3-path-style" v-model="s3Settings.forcePathStyle" />
        </div>
        <p class="text-sm text-surface-500 -mt-1">
          При включении адрес формируется как <code>endpoint/bucket/файл</code>.
          Обычно это нужно для S3-совместимых хранилищ; для AWS S3 можно отключить, тогда bucket будет частью адреса.
        </p>
      </div>
      <p class="text-sm mt-4">
        {{ s3Status }}
      </p>
      <p class="text-sm text-surface-500 mt-2">
        Настройки сохраняются автоматически при изменении полей.
      </p>
      <div class="flex flex-wrap gap-2 mt-4">
        <Button label="Проверить подключение" :loading="isCheckingS3" @click="handleS3Check" />
        <Button label="Синхронизировать сейчас" :loading="isSyncingS3" @click="handleS3Sync" />
      </div>
    </template>
  </Card>
</template>
