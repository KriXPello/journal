import { onScopeDispose, toValue, watch, type MaybeRefOrGetter } from 'vue';

export const useRecordLongPress = (options: {
  itemId: MaybeRefOrGetter<string>;
  enabled: MaybeRefOrGetter<boolean>;
  onSelect: (id: string) => void;
}) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pointer: { id: number; x: number; y: number; type: string } | undefined;
  let suppressClick = false;

  const cancel = () => {
    clearTimeout(timer);
    timer = undefined;
    pointer = undefined;
    // Preserve suppression until the release click, even when selection disables the gesture.
  };

  const onPointerDown = (event: PointerEvent) => {
    cancel();
    suppressClick = false;
    if (!toValue(options.enabled) || !event.isPrimary || event.button !== 0
      || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;

    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, type: event.pointerType };
    timer = setTimeout(() => {
      timer = undefined;
      suppressClick = true;
      options.onSelect(toValue(options.itemId));
    }, 500);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    if (Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 10) cancel();
  };

  const consumeClick = (event: MouseEvent) => {
    const shouldSuppress = suppressClick && event.detail > 0;
    suppressClick = false;
    if (shouldSuppress) {
      event.preventDefault();
      event.stopPropagation();
    }
    return shouldSuppress;
  };

  const onContextMenu = (event: MouseEvent) => {
    if (suppressClick || pointer?.type === 'touch') event.preventDefault();
  };

  watch([() => toValue(options.itemId), () => toValue(options.enabled)], cancel, { flush: 'sync' });
  onScopeDispose(cancel);

  return { onPointerDown, onPointerMove, cancel, consumeClick, onContextMenu };
};
