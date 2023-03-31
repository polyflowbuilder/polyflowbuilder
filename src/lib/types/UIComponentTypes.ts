import type { Props } from 'tippy.js';

// MutableForEachContainer
export type MutableForEachContainerItemInternal = {
  id: string;
  item: unknown;
};

export type FlowListItemData = {
  idx: number;
  name: string;
  tooltipParams: Partial<Props>;
};
