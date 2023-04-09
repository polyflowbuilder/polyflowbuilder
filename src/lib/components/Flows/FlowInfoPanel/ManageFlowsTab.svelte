<script lang="ts">
  import MutableForEachContainer from '$lib/components/common/MutableForEachContainer.svelte';
  import { flowListUIData } from '$lib/client/stores/UIDataStore';
  import { UserDataUpdateChunkType } from '$lib/types';
  import { submitUserDataUpdateChunk } from '$lib/client/util/mutateUserDataUtilClient';
  import { buildFlowListContainerItemsData } from '$lib/client/util/flowListItemUtil';
  import { FlowInfoPanelActionButtons, FlowListItem } from '$lib/components/Flows/FlowInfoPanel';
  import type { FlowListItemData } from '$lib/types';
  import type {
    FlowListChangeOrderEntry,
    FlowListChangeOrderField
  } from '$lib/common/schema/mutateUserDataSchema';

  $: items = buildFlowListContainerItemsData($flowListUIData);

  function onFlowListItemReorder(event: CustomEvent<FlowListItemData[]>) {
    const oldFlowListIdxs: number[] = [];
    const newFlowListIdxs: number[] = [];
    items.forEach((oldItem) => oldFlowListIdxs.push(oldItem.idx));
    event.detail.forEach((newItem) => newFlowListIdxs.push(newItem.idx));

    // only submit update if order changed
    if (newFlowListIdxs.toString() !== oldFlowListIdxs.toString()) {
      // create order entries specifying new positions of moved flows
      const orderEntryArr: FlowListChangeOrderEntry[] = [];
      newFlowListIdxs.forEach((val, idx) => {
        // only update idxs that changed
        if (val !== oldFlowListIdxs[idx]) {
          orderEntryArr.push({
            id: items[val].id,
            pos: idx
          });
        }
      });

      submitUserDataUpdateChunk({
        type: UserDataUpdateChunkType.FLOW_LIST_CHANGE,
        data: {
          // typecast here bc chunk type expects that at least one
          // entry is guaranteed to exist, whereas standard array type
          // can't guarantee that - since we know we have at least two
          // entries if we get to this point, it's safe to cast
          order: orderEntryArr as FlowListChangeOrderField
        }
      });
    }

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
