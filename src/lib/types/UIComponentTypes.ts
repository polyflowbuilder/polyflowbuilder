import type { Props } from 'tippy.js';

// TODO: add DNDContainer wrapper type

export type FlowListItemData = {
  id: number;
  name: string;
  tooltipParams: Partial<Props>;
};
