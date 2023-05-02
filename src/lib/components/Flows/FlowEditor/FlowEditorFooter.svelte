<script lang="ts">
  import { COLORS } from '$lib/common/config/colorConfig';
  import { onMount } from 'svelte';
  import type { FlowEditorFooterUnitCounts } from '$lib/types';

  export let unitCounts: FlowEditorFooterUnitCounts;

  let showUnitGroupLabels = true;
  let showGroupUnits = true;
  let showTotalUnitText = true;

  let footerElem: Element;
  let groupUnitElem: Element;
  let totalUnitElem: Element;

  let footerEntryWidth: number;
  let footerGroupEntryWidth: number;
  let footerTotalEntryWidth: number;

  let groupLabelHideThreshold: number | undefined;
  let groupHideThreshold: number | undefined;
  let totalUnitHideThreshold: number | undefined;

  $: {
    footerEntryWidth;
    footerGroupEntryWidth;
    footerTotalEntryWidth;
    updateUnitCounterResponsiveState();
  }

  function updateUnitCounterResponsiveState() {
    const totalUnitDistance = footerEntryWidth - footerTotalEntryWidth;
    const distance = totalUnitDistance - footerGroupEntryWidth;

    // going in
    if (distance <= 0) {
      if (!groupLabelHideThreshold) {
        groupLabelHideThreshold = totalUnitDistance;
        showUnitGroupLabels = false;
      } else if (!groupHideThreshold) {
        groupHideThreshold = totalUnitDistance;
        showGroupUnits = false;
      } else if (!totalUnitHideThreshold) {
        totalUnitHideThreshold = footerEntryWidth;
        showTotalUnitText = false;
      }
    }

    // going out
    if (totalUnitHideThreshold && footerEntryWidth > totalUnitHideThreshold) {
      totalUnitHideThreshold = undefined;
      showTotalUnitText = true;
    } else if (
      !totalUnitHideThreshold &&
      groupHideThreshold &&
      totalUnitDistance > groupHideThreshold
    ) {
      groupHideThreshold = undefined;
      showGroupUnits = true;
    } else if (
      !totalUnitHideThreshold &&
      !groupHideThreshold &&
      groupLabelHideThreshold &&
      totalUnitDistance > groupLabelHideThreshold
    ) {
      groupLabelHideThreshold = undefined;
      showUnitGroupLabels = true;
    }
  }

  function updateElementPositions(entries: ResizeObserverEntry[]) {
    const footerEntry = entries.find((entry) => entry.target.id === 'flowEditorFooter');
    const footerGroupEntry = entries.find((entry) => entry.target.id === 'flowEditorFooterGroup');
    const footerTotalEntry = entries.find((entry) => entry.target.id === 'flowEditorFooterTotal');

    if (footerEntry) {
      footerEntryWidth = footerEntry.contentRect.width;
    }
    if (footerGroupEntry) {
      footerGroupEntryWidth = footerGroupEntry.contentRect.width;
    }
    if (footerTotalEntry) {
      footerTotalEntryWidth = footerTotalEntry.contentRect.width;
    }
  }

  onMount(() => {
    const observer = new ResizeObserver((entries) => {
      updateElementPositions(entries);
    });

    // need to listen to changes on multiple elements
    observer.observe(footerElem);
    observer.observe(groupUnitElem);
    observer.observe(totalUnitElem);

    return () => observer.disconnect();
  });
</script>

<div
  bind:this={footerElem}
  class="flex mt-2 mx-1 h-full max-h-full"
  class:justify-between={showGroupUnits}
  class:justify-end={!showGroupUnits}
  id="flowEditorFooter"
>
  <div
    id="flowEditorFooterGroup"
    class="whitespace-nowrap"
    class:hidden={!showGroupUnits}
    bind:this={groupUnitElem}
  >
    <div class="inline-block">
      <div class="inline-block unitCounterSquare" style="background-color: {COLORS.major[0]};" />
      <span class="">{showUnitGroupLabels ? 'Major:' : ''} {unitCounts.major}</span>
    </div>
    <div class="ml-2 inline-block">
      <div class="inline-block unitCounterSquare" style="background-color: {COLORS.support[0]};" />
      <span class="">{showUnitGroupLabels ? 'Support:' : ''} {unitCounts.support}</span>
    </div>
    <div class="ml-2 inline-block">
      <div class="inline-block unitCounterSquare" style="background-color: {COLORS.conc1[0]};" />
      <span class="">{showUnitGroupLabels ? 'Concentration #1:' : ''} {unitCounts.conc1}</span>
    </div>
    <div class="ml-2 inline-block">
      <div class="inline-block unitCounterSquare" style="background-color: {COLORS.conc2[0]};" />
      <span class="">{showUnitGroupLabels ? 'Concentration #2:' : ''} {unitCounts.conc2}</span>
    </div>
    <div class="ml-2 inline-block">
      <div class="inline-block unitCounterSquare" style="background-color: {COLORS.ge[0]};" />
      <span class="">{showUnitGroupLabels ? 'GE:' : ''} {unitCounts.ge}</span>
    </div>
    <div class="ml-2 inline-block">
      <div class="inline-block unitCounterSquare" style="background-color: {COLORS.elective[0]};" />
      <span class="">{showUnitGroupLabels ? 'Free Elective:' : ''} {unitCounts.elective}</span>
    </div>
    <div class="ml-2 inline-block mr-6">
      <div class="inline-block unitCounterSquare" style="background-color: {COLORS.other[0]};" />
      <span class="">{showUnitGroupLabels ? 'Other:' : ''} {unitCounts.other}</span>
    </div>
  </div>
  <div
    id="flowEditorFooterTotal"
    class="whitespace-nowrap"
    class:hidden={!showTotalUnitText}
    bind:this={totalUnitElem}
  >
    <strong>Total Units: {unitCounts.total}</strong>
  </div>
</div>

<style lang="postcss">
  .unitCounterSquare {
    border: 1px solid hsla(var(--n) / 0.625);
    width: 1.25rem;
    height: 1.25rem;
    margin-top: 1px;
    margin-right: 0.25rem;
    float: left;
    clear: both;
  }
</style>
