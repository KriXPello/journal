import type { CollectionGroup, Item } from '~/shared/types';
import type { createGroupHierarchy } from './group-hierarchy';

export type CollectionView = 'navigation' | 'tree';

export type CollectionRow =
  | { id: string; kind: 'group'; group: CollectionGroup; depth: number; expanded: boolean }
  | { id: string; kind: 'item'; item: Item; depth: number; path: string };

export const buildCollectionRows = (options: {
  hierarchy: ReturnType<typeof createGroupHierarchy>;
  parentId: string | null;
  view: CollectionView;
  items: Item[];
  searching: boolean;
  expandedIds: Set<string>;
}): CollectionRow[] => {
  const { hierarchy, parentId, view, items, searching, expandedIds } = options;
  if (view === 'navigation' && searching) {
    return items.map(item => ({
      id: `item:${item.id}`,
      kind: 'item',
      item,
      depth: 0,
      path: hierarchy.getPath(item.groupId).map(group => group.label).join(' / '),
    }));
  }

  const itemsByGroup = new Map<string | null, Item[]>();
  const matchedGroupIds = new Set<string>();
  for (const item of items) {
    const list = itemsByGroup.get(item.groupId) ?? [];
    list.push(item);
    itemsByGroup.set(item.groupId, list);
    if (searching) {
      for (const group of hierarchy.getPath(item.groupId)) matchedGroupIds.add(group.id);
    }
  }

  const rows: CollectionRow[] = [];
  const pending: CollectionRow[] = [];
  const appendContents = (id: string | null, depth: number) => {
    const directItems = itemsByGroup.get(id) ?? [];
    for (let index = directItems.length - 1; index >= 0; index--) {
      const item = directItems[index]!;
      pending.push({ id: `item:${item.id}`, kind: 'item', item, depth, path: '' });
    }
    const groups = hierarchy.childrenByParent.get(id) ?? [];
    for (let index = groups.length - 1; index >= 0; index--) {
      const group = groups[index]!;
      if (searching && !matchedGroupIds.has(group.id)) continue;
      let expanded = false;
      if (view === 'tree') expanded = searching || expandedIds.has(group.id);
      pending.push({ id: `group:${group.id}`, kind: 'group', group, depth, expanded });
    }
  };

  appendContents(parentId, 0);
  while (pending.length > 0) {
    const row = pending.pop()!;
    rows.push(row);
    if (row.kind === 'group' && row.expanded) appendContents(row.group.id, row.depth + 1);
  }
  return rows;
};
