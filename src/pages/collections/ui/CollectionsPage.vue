<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useQuery } from '@pinia/colada';
import { collectionsQuery } from '~/shared/query';
import { RouteName } from '~/shared/routes';
import { PageHeader, PageHeaderAction, PageHeaderActions, PageHeaderTitle } from '~/shared/ui';

const router = useRouter();

const { data: collections, refetch, isLoading } = useQuery(collectionsQuery);

const isEditMode = ref(false);

const handleSettings = () => {
  router.push({ name: RouteName.Settings });
};

const handleEditCancel = () => {
  isEditMode.value = false;
};

const handleEditSave = () => {
  isEditMode.value = true;
};

const handleCreate = () => {
  router.push({ name: RouteName.CollectionCreate });
};

const handleRefresh = () => {
  refetch();
};

const sortedCollections = computed(() =>
  (collections.value ?? []).slice().sort((a, b) => a.orderNum - b.orderNum),
);

</script>

<template>
  <div class="size-full flex flex-col items-center relative">
    <div class="size-full max-w-xl relative flex flex-col">
      <PageHeader>
        <PageHeaderTitle title="Коллекции" />
        <PageHeaderActions>
          <template v-if="isEditMode">
            <PageHeaderAction
              rounded
              text
              severity="secondary"
              title="Отменить"
              aria-label="Отменить"
              @click="handleEditCancel"
            >
              <div class="i-[mdi--close] size-6" />
            </PageHeaderAction>
            <PageHeaderAction
              rounded
              text
              severity="secondary"
              title="Сохранить"
              aria-label="Сохранить"
              @click="handleEditSave"
            >
              <div class="i-[mdi--check] size-6" />
            </PageHeaderAction>
          </template>

          <template v-else>
            <PageHeaderAction
              rounded
              text
              severity="secondary"
              title="Создать"
              aria-label="Создать"
              @click="handleCreate"
            >
              <div class="i-[mdi--plus] size-6" />
            </PageHeaderAction>
            <PageHeaderAction
              rounded
              text
              severity="secondary"
              title="Обновить"
              aria-label="Обновить"
              :loading="isLoading"
              @click="handleRefresh"
            >
              <div class="i-[mdi--refresh] size-6" />
            </PageHeaderAction>
            <PageHeaderAction
              rounded
              text
              severity="secondary"
              title="Настройки"
              aria-label="Настройки"
              @click="handleSettings"
            >
              <div class="i-[mdi--cog] size-6" />
            </PageHeaderAction>
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
            class="p-4 border border-surface-200 rounded-lg flex gap-4"
            @click="navigate"
          >
            <span class="text-2xl">{{ coll.label }}</span>
          </a>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
