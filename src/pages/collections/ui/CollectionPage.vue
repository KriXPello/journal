<script setup lang="ts">
import { useTemplateRef, watch } from 'vue';
import Button from 'primevue/button';
import IftaLabel from 'primevue/iftalabel';
import InputText from 'primevue/inputtext';
import Menu from 'primevue/menu';
import { useCollectionActions } from '~/pages/collections/model/useCollectionActions';
import { useCollectionScope } from '~/pages/collections/model/useCollectionScope';
import { useCollectionSelection } from '~/pages/collections/model/useCollectionSelection';
import { useCollectionView } from '~/pages/collections/model/useCollectionView';
import CollectionFieldFilter from '~/pages/collections/ui/CollectionFieldFilter.vue';
import CollectionRows from '~/pages/collections/ui/CollectionRows.vue';
import CollectionSelectionFooter from '~/pages/collections/ui/CollectionSelectionFooter.vue';
import GroupDestinationDialog from '~/pages/collections/ui/GroupDestinationDialog.vue';
import GroupFormDialog from '~/pages/collections/ui/GroupFormDialog.vue';
import type { CollectionPageProps } from '~/shared/routes';
import { PageHeader, PageHeaderAction, PageHeaderActions, PageHeaderTitle } from '~/shared/ui';

const { collectionId, groupId } = defineProps<CollectionPageProps>();
const pageMenu = useTemplateRef<InstanceType<typeof Menu>>('pageMenu');
const groupMenu = useTemplateRef<InstanceType<typeof Menu>>('groupMenu');
const groupForm = useTemplateRef<InstanceType<typeof GroupFormDialog>>('groupForm');
const groupDestination = useTemplateRef<InstanceType<typeof GroupDestinationDialog>>('groupDestination');

const scope = useCollectionScope({
  collectionId: () => collectionId,
  groupId: () => groupId,
});
const {
  collection, groups, fields, currentId, header,
  isLoading, isGroupsLoading, goBack, createItem, refresh,
} = scope;
const { view, searchInput, searchFieldIds, searchQuery, searching, rows, activateGroup } = useCollectionView(scope);
const selection = useCollectionSelection(scope, rows, groupDestination);
const {
  isSelecting, selectedIds, selectedCount, availableCount, allSelected, partiallySelected,
  isBusy: isSelectionBusy, startSelection, cancelSelection, requestExit, toggleItem, toggleAll,
} = selection;
const { pageActions, groupActions, isGroupBusy, openGroupMenu } = useCollectionActions(scope, view, selection, {
  groupMenu,
  groupForm,
  groupDestination,
});

const handleBack = () => {
  if (isSelectionBusy.value) return;
  if (isSelecting.value && currentId.value === null) {
    requestExit();
  } else {
    goBack();
  }
};

const content = useTemplateRef<InstanceType<typeof CollectionRows>>('content');
watch([searchQuery, searchFieldIds, currentId, view], () => {
  content.value?.scrollToStart();
}, { flush: 'post' });
</script>

<template>
  <div v-if="collection" class="size-full flex flex-col items-center relative">
    <div class="size-full px-2 max-w-xl relative flex flex-col">
      <PageHeader @back="handleBack">
        <PageHeaderTitle :title="header.title" :subtitle="header.subtitle" class="min-w-0 break-words" />
        <PageHeaderActions class="shrink-0">
          <PageHeaderAction
            rounded
            text
            severity="secondary"
            aria-label="Обновить"
            :loading="isLoading"
            :disabled="isSelectionBusy"
            @click="refresh"
          >
            <div class="i-[mdi--refresh] size-6" />
          </PageHeaderAction>
          <PageHeaderAction
            rounded
            text
            severity="secondary"
            aria-label="Меню коллекции"
            aria-haspopup="true"
            aria-controls="collection-menu"
            :disabled="isGroupBusy || isGroupsLoading || isSelectionBusy"
            @click="pageMenu?.toggle($event)"
          >
            <div class="i-[mdi--dots-vertical] size-6" />
          </PageHeaderAction>
        </PageHeaderActions>
      </PageHeader>
      <Menu id="collection-menu" ref="pageMenu" :model="pageActions" popup />
      <Menu id="group-menu" ref="groupMenu" :model="groupActions" popup />

      <div class="flex gap-1">
        <CollectionFieldFilter v-model="searchFieldIds" :fields="fields" />
        <IftaLabel class="grow min-w-0">
          <InputText id="search-value" v-model="searchInput" class="w-full" type="search" />
          <label for="search-value">Поиск, включая подгруппы</label>
        </IftaLabel>
      </div>

      <div class="grow min-h-0 mt-4">
        <CollectionRows
          ref="content"
          :collection-id="collectionId"
          :fields="fields"
          :rows="rows"
          :view="view"
          :searching="searching"
          :loading="isLoading"
          :group-actions-disabled="isGroupBusy || isSelecting"
          :selection-active="isSelecting"
          :selected-ids="selectedIds"
          :selection-disabled="isSelectionBusy || isGroupBusy"
          @activate-group="activateGroup"
          @group-menu="openGroupMenu"
          @toggle-item="toggleItem"
          @select-item="startSelection"
        />
      </div>

      <div v-if="!isSelecting" class="absolute z-2 bottom-0 right-0 p-4">
        <Button rounded size="large" aria-label="Создать запись" :disabled="isGroupsLoading" @click="createItem(currentId)">
          <div class="i-[mdi--plus] size-6" />
        </Button>
      </div>
      <CollectionSelectionFooter
        v-if="isSelecting"
        :selected-count="selectedCount"
        :available-count="availableCount"
        :all-selected="allSelected"
        :partially-selected="partiallySelected"
        :busy="isSelectionBusy"
        @exit="requestExit"
        @toggle-all="toggleAll"
      />
      <GroupFormDialog ref="groupForm" :collection-id="collectionId" />
      <GroupDestinationDialog
        ref="groupDestination"
        :groups="groups"
        :collection-label="collection.label"
        @items-moved="cancelSelection"
      />
    </div>
  </div>
</template>
