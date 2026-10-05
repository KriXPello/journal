import type { CollectionGroup } from '~/shared/types';

export const createGroupHierarchy = (groups: CollectionGroup[]) => {
  const byId = new Map(groups.map(group => [group.id, group]));
  const childrenByParent = new Map<string | null, CollectionGroup[]>();

  for (const group of groups) {
    const children = childrenByParent.get(group.parentId) ?? [];
    children.push(group);
    childrenByParent.set(group.parentId, children);
  }

  for (const children of childrenByParent.values()) {
    children.sort((a, b) => a.label.localeCompare(b.label, 'ru'));
  }

  const getDescendantIds = (parentId: string | null) => {
    const ids = new Set<string>();
    const pending = [...(childrenByParent.get(parentId) ?? [])];
    while (pending.length > 0) {
      const group = pending.pop()!;
      ids.add(group.id);
      pending.push(...(childrenByParent.get(group.id) ?? []));
    }
    return ids;
  };

  const getPath = (groupId: string | null) => {
    const path: CollectionGroup[] = [];
    let currentId = groupId;
    while (currentId !== null) {
      const group = byId.get(currentId);
      if (!group) break;
      path.push(group);
      currentId = group.parentId;
    }
    return path.reverse();
  };

  return { byId, childrenByParent, getDescendantIds, getPath };
};
