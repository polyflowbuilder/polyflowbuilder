<script lang="ts">
  import { FlowEditor } from '$lib/components/Flows/FlowEditor';
  import type { Flowchart } from '$lib/common/schema/flowchartSchema';

  export let flowchart: Flowchart | null;
  export let displayCreditBin: boolean = false;

  $: displayCreditBin = flowchart?.termData.find((term) => term.tIndex === -1)?.tUnits !== '0';
</script>

<!-- main container to view and edit a user's flowchart in -->

<!-- width class here is for making sure term container elements dont expand parent container size -->
<!-- see https://stackoverflow.com/questions/43809612/prevent-a-child-element-from-overflowing-its-parent-in-flexbox -->
<div class="flowViewer card flex-1 min-w-0">
  <div class="card-body p-2 h-full">
    {#if flowchart !== null}
      <FlowEditor {flowchart} flowchartId={flowchart.id} {displayCreditBin} />
    {:else}
      <div class="m-auto">
        <!-- center text when viewer gets small -->
        <h2 class="font-medium text-center text-polyGreen text-4xl">
          No flow selected. Please select or create a flow.
        </h2>
      </div>
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
