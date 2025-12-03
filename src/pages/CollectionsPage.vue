<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import PageHeader from '~/components/PageHeader.vue';
import { useRepositoryCollection } from '~/repositories';
import { useDataStore } from '~/stores/data';
import { useLoadingStore } from '~/stores/loading';
import { RouteName } from '~/types/routes';

const { startLoading, endLoading } = useLoadingStore();

const { collections, setCollections } = useDataStore();
const repoCollection = useRepositoryCollection();

const handleRefresh = async () => {
  startLoading();
  try {
    const list = await repoCollection.getAll();
    setCollections(list);
  } catch (err) {
    // TODO: refactor
    alert('Error: ' + String(err));
  } finally {
    endLoading();
  }
};

const isEditMode = ref(false);

// TODO: use
const handleSettings = () => {
  isEditMode.value = true;
};

const handleEditCancel = () => {
  isEditMode.value = false;
};

const handleEditSave = () => {
  isEditMode.value = true;
};


const router = useRouter();

const handleCreate = () => {
  router.push({ name: RouteName.CollectionCreate });
};

</script>

<template>
  <div class="size-full flex flex-col items-center relative">
    <div class="size-full max-w-xl relative flex flex-col">
      <PageHeader>
        Коллекции
        <template #extra>
          <div class="flex gap-2">
            <template v-if="isEditMode">
              <button
                class="btn btn-circle btn-ghost btn-sm"
                title="Отменить"
                @click="handleEditCancel"
              >
                <div class="i-[mdi--close] size-6" />
              </button>
              <button
                class="btn btn-circle btn-ghost btn-sm"
                title="Сохранить"
                @click="handleEditSave"
              >
                <div class="i-[mdi--check] size-6" />
              </button>
            </template>

            <template v-else>
              <button
                class="btn btn-circle btn-ghost btn-sm"
                title="Создать"
                @click="handleCreate"
              >
                <div class="i-[mdi--plus] size-6" />
              </button>
              <button
                class="btn btn-circle btn-ghost btn-sm"
                title="Обновить"
                @click="handleRefresh"
              >
                <div class="i-[mdi--refresh] size-6" />
              </button>
              <!-- <button
                class="btn btn-circle btn-ghost btn-sm"
                title="Настройки"
                @click="handleSettings"
              >
                <div class="i-[mdi--cog] size-6" />
              </button> -->
            </template>
          </div>
        </template>
      </PageHeader>
      <div class="grow min-h-0">
        <div />
      </div>
    </div>
  </div>
</template>
