import { browser } from '$app/environment';
import { MAX_TOOLTIP_WIDTH_PX } from '$lib/client/config/uiConfig';
import type { FlowListItemData, FlowListUIData } from '$lib/types';

// TODO: integrate dnd functionality
// TODO: rename types - a bit of a mess right now
export function buildFlowListDNDItems(flowListUIData: FlowListUIData[]): Array<FlowListItemData> {
  const items: FlowListItemData[] = [];
  for (let idx = 0; idx < flowListUIData.length; idx++) {
    const itemData: FlowListItemData = {
      id: idx,
      name: flowListUIData[idx].name,
      tooltipParams: {}
    };

    // can only generate HTML content for tooltip in browser
    if (browser) {
      itemData.tooltipParams = {
        arrow: false,
        placement: 'right-start',
        theme: 'light-border',
        allowHTML: true,
        content: generateFlowListItemTooltipHTML(flowListUIData[idx]),
        maxWidth: MAX_TOOLTIP_WIDTH_PX,
        hideOnClick: false
      };
    }
    items.push(itemData);
  }
  return items;
}

function generateFlowListItemTooltipHTML(flowListItemData: FlowListUIData): Element {
  const tooltipTemplate = document.createElement('div');
  tooltipTemplate.innerHTML =
    '<div><strong class="text-sm"></strong><p class="text-sm my-1"><strong>Starting Year: </strong></p></div>';
  const tooltipElem = tooltipTemplate.firstElementChild as HTMLDivElement;

  tooltipElem.children[0].appendChild(document.createTextNode(flowListItemData.name));

  // should never have case where startYear is not defined but keep in failsafe as backup
  tooltipElem.children[1].appendChild(
    document.createTextNode(flowListItemData.startYear || 'Same as catalog')
  );

  // add info for each program
  flowListItemData.displayInfo.forEach((displayInfoProgram) => {
    (tooltipElem.lastElementChild as Element).insertAdjacentHTML(
      'afterend',
      "<div class='divider my-1'></div>"
    );

    // create and insert elements
    const catalogDisplayElem = document.createElement('p');
    catalogDisplayElem.innerHTML = '<p class="text-sm my-1"><strong>Catalog: </strong></p>';
    catalogDisplayElem.children[0].appendChild(document.createTextNode(displayInfoProgram.catalog));
    tooltipElem.appendChild(catalogDisplayElem);

    const majorDisplayElem = document.createElement('p');
    majorDisplayElem.innerHTML = '<p class="text-sm my-1"><strong>Program: </strong></p>';
    majorDisplayElem.children[0].appendChild(document.createTextNode(displayInfoProgram.majorName));
    tooltipElem.appendChild(majorDisplayElem);

    if (displayInfoProgram.concName) {
      const concDisplayElem = document.createElement('p');
      concDisplayElem.innerHTML = '<p class="text-sm my-1"><strong>Concentration: </strong></p>';
      concDisplayElem.children[0].appendChild(document.createTextNode(displayInfoProgram.concName));
      tooltipElem.appendChild(concDisplayElem);
    }
  });

  if (flowListItemData.notes) {
    (tooltipElem.lastElementChild as Element).insertAdjacentHTML(
      'afterend',
      '<div class="divider my-1"></div><p class="text-sm mb-1"><strong>Notes:</strong></p><p></p>'
    );
    (tooltipElem.lastElementChild as Element).appendChild(
      document.createTextNode(flowListItemData.notes)
    );
  }

  return tooltipElem;
}
