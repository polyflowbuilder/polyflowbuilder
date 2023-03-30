import type { Props } from 'tippy.js';

// MutableForEachContainer
export type MutableForEachContainerItemInternal = {
  id: string;
  item: unknown;
};

export type FlowListItemData = {
  id: number;
  name: string;
  tooltipParams: Partial<Props>;
};
