import type { Props } from 'tippy.js';

// button group tooltip configs
export const viewingFlowInfoPanelTooltipConfig: Partial<Props> = {
  placement: 'top',
  content: 'Show/hide Flow Info Panel',
  hideOnClick: true
};

export const flowEditorLeftScrollTooltipConfig: Partial<Props> = {
  placement: 'top',
  content: 'Scroll Flow Editor left',
  hideOnClick: true
};

export const flowEditorRightScrollTooltipConfig: Partial<Props> = {
  placement: 'top',
  content: 'Scroll Flow Editor right',
  hideOnClick: true
};
