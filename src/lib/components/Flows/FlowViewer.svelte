<script>
  import { FlowEditor } from '$lib/components/Flows/FlowEditor';
  import { userFlowcharts } from '$lib/client/stores/userDataStore';
  import { selectedFlowIndex } from '$lib/client/stores/UIDataStore';
</script>

<!-- main container to view and edit a user's flowchart in -->

<div class="flowViewer card flex-1">
  <div class="card-body p-2 h-full">
    {#if $selectedFlowIndex === -1}
      <div class="m-auto">
        <!-- center text when viewer gets small -->
        <h2 class="font-medium text-center text-polyGreen text-4xl">
          No flow selected. Please select or create a flow.
        </h2>
      </div>
    {:else}
      <FlowEditor flowchart={$userFlowcharts[$selectedFlowIndex]} />
    {/if}
  </div>
</div>

<style lang="postcss">
  .flowViewer.card {
    @apply shadow border-base-300 mx-2 mt-0 rounded-sm;

    /* make shadow a hair darker */
    --tw-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.16);
  }
</style>
