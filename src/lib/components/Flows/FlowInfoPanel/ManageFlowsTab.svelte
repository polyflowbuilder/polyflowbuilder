<script lang="ts">
  import { flowListUIData } from '$lib/client/stores/UIDataStore';
  import { buildFlowListDNDItems } from '$lib/client/util/flowListItemUtil';
  import { FlowInfoPanelActionButtons, FlowListItem } from '$lib/components/Flows/FlowInfoPanel';

  $: items = buildFlowListDNDItems($flowListUIData);
</script>

<!-- see https://stackoverflow.com/questions/38066204/prevent-child-div-from-overflowing-parent-div -->
<div class="h-full">
  <div class="max-h-full flex flex-col">
    <h2 class="text-4xl font-medium text-polyGreen text-center mb-2">Flows</h2>
    <FlowInfoPanelActionButtons />
    <div class="divider my-2" />

    <div class="overflow-y-scroll">
      {#if items.length === 0}
        <div class="text-center">
          <small class="text-gray-500">You do not have any flows. Start by creating one!</small>
        </div>
      {:else}
        {#each items as item}
          <div class="mx-[2px]">
            <FlowListItem {item} />
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
