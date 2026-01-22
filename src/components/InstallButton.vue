<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const deferredPrompt = ref<any>(null);
const showInstallButton = ref(false);
const isInstalled = ref(false);

const checkIsInstalled = () => {
  const isTrue = window.matchMedia('(display-mode: standalone)').matches
    || ('standalone' in window.navigator && !!window.navigator.standalone)
    || document.referrer.includes('android-app://');
  return isTrue;
};

const handleBeforeInstallPrompt = (e: any) => {
  e.preventDefault();
  deferredPrompt.value = e;
  showInstallButton.value = true;

  console.log('PWA можно установить!');
};

const installPWA = async () => {
  if (!deferredPrompt.value) {
    alert('Установка недоступна в вашем браузере');
    return;
  }

  (deferredPrompt.value as any).prompt();

  const { outcome } = await deferredPrompt.value.userChoice;

  if (outcome === 'accepted') {
    console.log('Пользователь установил PWA');
    isInstalled.value = true;
    showInstallButton.value = false;
  } else {
    console.log('Пользователь отказался от установки');
    setTimeout(() => {
      showInstallButton.value = true;
    }, 3000);
  }

  deferredPrompt.value = null;
};

const handleAppInstalled = () => {
  console.log('PWA было установлено');
  isInstalled.value = true;
  showInstallButton.value = false;
  deferredPrompt.value = null;
};

onMounted(() => {
  isInstalled.value = checkIsInstalled();

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.addEventListener('appinstalled', handleAppInstalled);
});

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  window.removeEventListener('appinstalled', handleAppInstalled);
});
</script>

<template>
  <button
    v-if="showInstallButton && !isInstalled"
    class="btn btn-info btn-circle animate-bounce"
    :disabled="isInstalled"
    title="Установить (PWA)"
    @click="installPWA"
  >
    <div class="i-[mdi--download-outline] text-info-content size-6"></div>
  </button>
</template>
