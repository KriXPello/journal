<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import { useMutation } from '@pinia/colada';
import Button from 'primevue/button';
import Card from 'primevue/card';
import { useAppNotify } from '~/shared/lib/interaction';
import { buildAppDataBackupFileName, parseAppDataBackup, serializeAppDataBackup } from '~/shared/lib/app-data';
import {
  clearAllAppDataMutation,
  exportBackupMutation,
  importBackupMutation,
} from '~/shared/query';
import { PageHeader, PageHeaderTitle } from '~/shared/ui';

const { showError, showSuccess, confirmAction } = useAppNotify();

const { mutateAsync: exportBackup, isLoading: isExporting } = useMutation(exportBackupMutation);
const { mutateAsync: importBackup, isLoading: isImporting } = useMutation(importBackupMutation);
const { mutateAsync: clearAll, isLoading: isClearing } = useMutation(clearAllAppDataMutation);

const fileInput = useTemplateRef('fileInput');
const lastImportMessage = ref('');

const handleExport = async () => {
  try {
    const backup = await exportBackup();
    const text = serializeAppDataBackup(backup);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = buildAppDataBackupFileName();
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    showError('Ошибка экспорта: ' + String(err));
  }
};

const openImportDialog = () => {
  fileInput.value?.click();
};

const handleImport = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';

  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const backup = parseAppDataBackup(text);
    const summary = await importBackup(backup);
    lastImportMessage.value = `Импортировано: коллекций ${summary.collections}, записей ${summary.items}, дней калорий ${summary.foodTakeGroups}.`;
    showSuccess(lastImportMessage.value);
  } catch (err) {
    showError('Ошибка импорта: ' + String(err));
  }
};

const handleClearAll = async () => {
  const isConfirmed = await confirmAction({
    message: 'Очистить все данные приложения?',
    acceptLabel: 'Очистить',
    rejectLabel: 'Отмена',
  });
  if (!isConfirmed) {
    return;
  }

  try {
    await clearAll();
    lastImportMessage.value = 'Все данные очищены.';
    showSuccess(lastImportMessage.value);
  } catch (err) {
    showError('Ошибка очистки: ' + String(err));
  }
};
</script>

<template>
  <div class="size-full flex flex-col items-center relative">
    <div class="size-full max-w-xl relative flex flex-col">
      <PageHeader>
        <PageHeaderTitle title="Настройки" subtitle="Бэкап и восстановление данных" />
      </PageHeader>

      <div class="grow min-h-0 overflow-y-auto px-2 py-4 flex flex-col gap-4">
        <Card class="bg-surface-100">
          <template #title>
            Бэкап
          </template>
          <template #content>
            <p class="mb-3">
              Экспортирует текущие коллекции, записи и данные калорий в versioned JSON файл.
            </p>
            <Button label="Экспортировать данные" :loading="isExporting" @click="handleExport" />
          </template>
        </Card>

        <Card class="bg-surface-100">
          <template #title>
            Восстановление
          </template>
          <template #content>
            <p class="mb-3">
              Импорт объединяет данные с текущими: записи с тем же ключом будут обновлены.
            </p>
            <Button
              label="Импортировать данные"
              severity="secondary"
              :loading="isImporting"
              @click="openImportDialog"
            />
            <input
              ref="fileInput"
              class="hidden"
              type="file"
              accept="application/json,.json"
              @change="handleImport"
            >
            <p v-if="lastImportMessage" class="text-sm mt-3">
              {{ lastImportMessage }}
            </p>
          </template>
        </Card>

        <Card class="bg-surface-100 border border-danger/30">
          <template #title>
            <span class="text-danger">Очистка данных</span>
          </template>
          <template #content>
            <p class="mb-3">
              Удаляет все локальные данные приложения. Используй после бэкапа или когда нужна полная замена.
            </p>
            <Button
              label="Очистить все данные"
              severity="danger"
              :loading="isClearing"
              @click="handleClearAll"
            />
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>
