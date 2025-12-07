import type { ObjectDirective } from 'vue';

type LongPressHandler = (event: PointerEvent) => void;

type DirectiveValue = LongPressHandler | {
  onClick: (event: PointerEvent) => void;
  onLongPress: (event: PointerEvent) => void;
};

export const vLongPress: ObjectDirective<HTMLElement, DirectiveValue, string, number> = {
  mounted: (el, binding) => {
    let timeout: number | undefined;

    const removeTimeout = () => {
      clearTimeout(timeout);
      timeout = undefined;
    };

    const start = (event: PointerEvent) => {
      el.setPointerCapture(event.pointerId);
      timeout = setTimeout(() => {
        timeout = undefined;
        const fnOrObject = binding.value;
        const longPressHandler = typeof fnOrObject == 'function'
          ? fnOrObject
          : fnOrObject.onLongPress;
        longPressHandler(event);
      }, binding.arg ?? 300);
    };

    const end = (event: PointerEvent) => {
      /** Если есть активный таймаут, значит longPress еще не сработал */
      const isClick = timeout != undefined;
      const fnOrObject = binding.value;
      if (isClick && typeof fnOrObject == 'object') {
        fnOrObject.onClick(event);
      }
      removeTimeout();
    };

    el.addEventListener('pointerdown', start);
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', removeTimeout);
  },
};
