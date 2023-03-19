import tippy from 'tippy.js';
import type { Props } from 'tippy.js';

// actions: https://blog.logrocket.com/svelte-actions-introduction/
export function tooltip(
  node: Element,
  params: Partial<Props>
): {
  update?: (params: Partial<Props>) => void;
  destroy?: () => void;
} {
  const tip = tippy(node, params);
  return {
    update: (newParams: Partial<Props>) => {
      tip.setProps(newParams);
    },
    destroy: () => {
      tip.destroy();
    }
  };
}
