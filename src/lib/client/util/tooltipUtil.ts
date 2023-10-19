import tippy from 'tippy.js';
import { MAX_TOOLTIP_WIDTH_PX } from '$lib/client/config/uiConfig';
import type { Props } from 'tippy.js';

function mergeDefaultTooltipParams(params: Partial<Props>): Partial<Props> {
  return {
    maxWidth: MAX_TOOLTIP_WIDTH_PX,
    ...params
  };
}

// actions: https://blog.logrocket.com/svelte-actions-introduction/
export function tooltip(
  node: Element,
  params: Partial<Props>
): {
  update?: (params: Partial<Props>) => void;
  destroy?: () => void;
} {
  const tip = tippy(node, mergeDefaultTooltipParams(params));
  return {
    update: (newParams: Partial<Props>) => {
      tip.setProps(mergeDefaultTooltipParams(newParams));
    },
    destroy: () => {
      tip.destroy();
    }
  };
}
