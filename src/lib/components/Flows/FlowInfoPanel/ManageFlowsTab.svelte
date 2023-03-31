<script lang="ts">
  import MutableForEachContainer from '$lib/components/common/MutableForEachContainer.svelte';
  import { flowListUIData } from '$lib/client/stores/UIDataStore';
  import { buildFlowListContainerItemsData } from '$lib/client/util/flowListItemUtil';
  import { FlowInfoPanelActionButtons, FlowListItem } from '$lib/components/Flows/FlowInfoPanel';
  import type { FlowListItemData } from '$lib/types';

  $: items = buildFlowListContainerItemsData($flowListUIData);

  function onFlowListItemReorder(event: CustomEvent<FlowListItemData[]>) {
    const oldFlowListIdxs: number[] = [];
    const newFlowListIdxs: number[] = [];
    items.forEach((oldItem) => oldFlowListIdxs.push(oldItem.idx));
    event.detail.forEach((newItem) => newFlowListIdxs.push(newItem.idx));

    // TODO: if idx orders are different, push update to backend

    items = event.detail;
  }
</script>

<!-- see https://stackoverflow.com/questions/38066204/prevent-child-div-from-overflowing-parent-div -->
<div class="h-full">
  <div class="max-h-full flex flex-col">
    <h2 class="text-4xl font-medium text-polyGreen text-center mb-2">Flows</h2>
    <FlowInfoPanelActionButtons />
    <div class="divider my-2" />

    {#if items.length === 0}
      <div class="text-center">
        <small class="text-gray-500">You do not have any flows. Start by creating one!</small>
      </div>
    {:else}
      <MutableForEachContainer
        {items}
        component={FlowListItem}
        dndType="flowList"
        itemClass="mx-[2px]"
        on:itemsReorder={onFlowListItemReorder}
      />
    {/if}
  </div>
</div>
