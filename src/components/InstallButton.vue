<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const deferredPrompt = ref<any>(null);
const showInstallButton = ref(false);
const isInstalled = ref(false);

// Тексты кнопки
const buttonText = ref('📱 Установить приложение');

// Проверяем, установлено ли уже приложение
const checkIsInstalled = () => {
  isInstalled.value = window.matchMedia('(display-mode: standalone)').matches ||
                     'standalone' in window.navigator ||
                     document.referrer.includes('android-app://');
};

// Обработчик события beforeinstallprompt
const handleBeforeInstallPrompt = (e: any) => {
  // Предотвращаем автоматическое отображение баннера
  e.preventDefault();
  // Сохраняем событие для последующего использования
  deferredPrompt.value = e;
  // Показываем нашу кнопку
  showInstallButton.value = true;

  // Можно также показать уведомление
  console.log('PWA можно установить!');
};

// Обработчик установки
const installPWA = async () => {
  if (!deferredPrompt.value) {
    alert('Установка недоступна в вашем браузере');
    return;
  }

  // Показываем стандартное диалоговое окно установки
  (deferredPrompt.value as any).prompt();

  // Ждем ответа пользователя
  const { outcome } = await deferredPrompt.value.userChoice;

  if (outcome === 'accepted') {
    console.log('Пользователь установил PWA');
    buttonText.value = '✅ Установлено';
    isInstalled.value = true;
    showInstallButton.value = false;
  } else {
    console.log('Пользователь отказался от установки');
    buttonText.value = '❌ Установка отменена';
    // Можно скрыть кнопку на некоторое время
    setTimeout(() => {
      buttonText.value = '📱 Установить приложение';
    }, 3000);
  }

  // Очищаем сохраненное событие
  deferredPrompt.value = null;
};

// Обработчик после установки
const handleAppInstalled = () => {
  console.log('PWA было установлено');
  isInstalled.value = true;
  showInstallButton.value = false;
  deferredPrompt.value = null;
};

// Инициализация
onMounted(() => {
  checkIsInstalled();

  // Слушаем события PWA
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);

  // Для iOS
  if ('standalone' in window.navigator) {
    isInstalled.value = !!window.navigator.standalone;
  }
});

// Очистка
onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.removeEventListener('appinstalled', handleAppInstalled);
});
</script>

<template>
  <button
    v-if="showInstallButton && !isInstalled"
    class="btn btn-primary size-6"
    :disabled="isInstalled"
    @click="installPWA"
  >
    {{ buttonText }}
  </button>
</template>
