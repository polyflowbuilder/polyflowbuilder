<script lang="ts">
  import { afterUpdate } from 'svelte';
  import { computeGroupUnits } from '$lib/client/util/unitCounterUtilClient';
  import { generateTermString } from '$lib/common/util/flowTermUtilCommon';
  import { TERM_CONTAINER_WIDTH_PX } from '$lib/client/config/uiConfig';
  import { courseCache, programCache } from '$lib/client/stores/apiDataStore';
  import {
    FlowEditorHeader,
    FlowEditorFooter,
    TermContainer
  } from '$lib/components/Flows/FlowEditor';
  import type { Flowchart } from '$lib/common/schema/flowchartSchema';

  // props
  export let flowchart: Flowchart;
  export let flowchartId: string;
  export let displayCreditBin: boolean;

  // for flowchart scrolling
  let termsContainerScroll = 0;
  let termsContainerClientWidth = 0;
  let termsContainerScrollWidth = 0;
  let termsContainer: Element | undefined;

  $: scrollable = termsContainerScrollWidth > termsContainerClientWidth;
  $: enableLeftScrollArrow = scrollable && termsContainerScroll > 0;
  $: enableRightScrollArrow =
    scrollable && termsContainerClientWidth + termsContainerScroll < termsContainerScrollWidth;

  // for group unit counts
  $: unitCounts = computeGroupUnits(flowchart, $courseCache, $programCache);

  // scroll width for terms container is only accurate after DOM is in sync with state
  afterUpdate(() => {
    if (termsContainer) {
      termsContainerScrollWidth = termsContainer.scrollWidth;
    }
  });

  function leftScrollArrowClickEventHandler() {
    if (termsContainer) {
      termsContainer.scrollLeft -= TERM_CONTAINER_WIDTH_PX;
    }
  }
  function rigthScrollArrowClickEventHandler() {
    if (termsContainer) {
      termsContainer.scrollLeft += TERM_CONTAINER_WIDTH_PX;
    }
  }
  function scrollEventHandler() {
    if (termsContainer) {
      termsContainerScroll = termsContainer.scrollLeft;
    }
  }

  // TODO: test later that any flow updates don't reset the scroll
  // scroll should only reset when a flow is changed
  // (which is why we have the explicit flowchartId prop)
  function resetScroll() {
    if (termsContainer) {
      termsContainer.scrollLeft = 0;
    }
  }

  $: {
    // TODO: fix in Svelte 5 migration
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    flowchartId;
    resetScroll();
  }

  $: displayedTermData = displayCreditBin ? flowchart.termData : flowchart.termData.slice(1);
</script>

<div class="h-full">
  <div class="flowEditorHeader">
    <FlowEditorHeader
      name={flowchart.name}
      {enableLeftScrollArrow}
      {enableRightScrollArrow}
      on:leftScrollArrowClick={leftScrollArrowClickEventHandler}
      on:rightScrollArrowClick={rigthScrollArrowClickEventHandler}
    />
  </div>
  <!-- bind here bc if we bind width in child element below centering of term containers breaks -->
  <div class="flowEditorTermsContainer" bind:clientWidth={termsContainerClientWidth}>
    <div
      class="h-full flex border-2 overflow-x-auto border-slate-400"
      bind:this={termsContainer}
      on:scroll={scrollEventHandler}
    >
      {#if flowchart.termData.slice(1).length}
        {#each displayedTermData as term}
          <TermContainer
            flowId={flowchart.id}
            flowProgramId={flowchart.programId}
            termName={generateTermString(term.tIndex, flowchart.startYear)}
            {term}
          />
        {/each}
      {:else}
        <!-- TODO: make this text configurable if we use the viewer in other places on the website -->
        <h2 class="font-medium m-auto text-center text-polyGreen text-4xl">
          This flow does not have any terms. Add terms by clicking "Actions", then "Add Terms".
        </h2>
      {/if}
    </div>
  </div>
  <div class="flowEditorFooter">
    <FlowEditorFooter {unitCounts} />
  </div>
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
