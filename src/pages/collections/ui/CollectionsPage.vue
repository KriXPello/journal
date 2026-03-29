<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useDataStore, useLoadingStore } from '~/shared/lib/app-state';
import { useRepositoryCollection } from '~/shared/storage';
import { RouteName } from '~/shared/routes';
import { PageHeader, PageHeaderActions, PageHeaderTitle } from '~/shared/ui';

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
  router.push({ name: RouteName.Settings });
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

const sortedCollections = computed(() => collections.value.slice().sort((a, b) => a.orderNum - b.orderNum));

</script>

<template>
  <div class="size-full flex flex-col items-center relative">
    <div class="size-full max-w-xl relative flex flex-col">
      <PageHeader>
        <PageHeaderTitle title="Коллекции" />
        <PageHeaderActions>
          <template v-if="isEditMode">
            <button
              class="btn-header-action"
              title="Отменить"
              @click="handleEditCancel"
            >
              <div class="i-[mdi--close] size-6" />
            </button>
            <button
              class="btn-header-action"
              title="Сохранить"
              @click="handleEditSave"
            >
              <div class="i-[mdi--check] size-6" />
            </button>
          </template>

          <template v-else>
            <button
              class="btn-header-action"
              title="Создать"
              @click="handleCreate"
            >
              <div class="i-[mdi--plus] size-6" />
            </button>
            <button
              class="btn-header-action"
              title="Обновить"
              @click="handleRefresh"
            >
              <div class="i-[mdi--refresh] size-6" />
            </button>
            <button
              class="btn-header-action"
              title="Настройки"
              @click="handleSettings"
            >
              <div class="i-[mdi--cog] size-6" />
            </button>
          </template>
        </PageHeaderActions>
      </PageHeader>
      <div class="grow min-h-0 overflow-y-auto flex flex-col gap-2">
        <RouterLink
          v-for="coll of sortedCollections"
          :key="coll.id"
          v-slot="{ href, navigate }"
          custom
          :to="{ name: RouteName.Collection, params: { collectionId: coll.id }}"
        >
          <a
            :href="href"
            class="p-4 border border-base-200 rounded-box flex gap-4"
            @click="navigate"
          >
            <span class="text-2xl">{{ coll.label }}</span>
          </a>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
