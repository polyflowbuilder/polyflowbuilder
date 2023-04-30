<script lang="ts">
  import { generateTermString } from '$lib/client/util/flowTermUtilClient';
  import { FlowEditorHeader, TermContainer } from '$lib/components/Flows/FlowEditor';
  import type { Flowchart } from '$lib/common/schema/flowchartSchema';

  export let flowchart: Flowchart;

  export let displayCreditBin: boolean;

  $: displayedTermData = displayCreditBin ? flowchart.termData : flowchart.termData.slice(1);

  $: console.log('flowchart in editor', flowchart);
</script>

<div class="h-full">
  <div class="flowEditorHeader">
    <FlowEditorHeader name={flowchart.name} />
  </div>
  <div class="flowEditorTermsContainer">
    <div class="h-full flex border-2 overflow-x-scroll border-slate-400">
      {#if flowchart.termData.slice(1).length}
        {#each displayedTermData as term}
          <TermContainer
            flowProgramId={flowchart.programId}
            termName={generateTermString(term.tIndex, flowchart.startYear)}
            {term}
          />
        {/each}
      {:else}
        <!-- TODO: make this text configurable if we use the viewer in other places on the website -->
        <h2 class="font-medium m-auto text-polyGreen text-4xl">
          This flow does not have any terms. Add terms by clicking "Actions", then "Add Terms".
        </h2>
      {/if}
    </div>
  </div>
  <div class="flowEditorFooter">units: {flowchart.unitTotal}</div>
</div>

<style lang="postcss">
  .flowEditorHeader {
    height: 3rem;
  }
  .flowEditorTermsContainer {
    /* 3rem header, 2rem footer */
    height: calc(100% - 3rem - 2rem);
  }
  .flowEditorFooter {
    height: 2rem;
  }
</style>
