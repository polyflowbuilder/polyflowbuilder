<script lang="ts">
  import { userFlowcharts } from '$lib/client/stores/userDataStore';
  import { flowListUIData, selectedFlowIndex } from '$lib/client/stores/UIDataStore';

  export let searchProgramIndex = -1;

  // TODO: if we don't have a concentration, don't include it in the friendly name
  function createSearchFlowProgramSelectorFriendlyName(i: number) {
    const displayInfoObj = $flowListUIData[$selectedFlowIndex].displayInfo[i];
    const displayInfo = [displayInfoObj.catalog, displayInfoObj.majorName, displayInfoObj.concName];
    return displayInfo.join(' - ');
  }
</script>

<div>
  <label class="input-group input-group-sm">
    <span class="select-none">Program:</span>
    <select
      class="select select-bordered select-sm overflow-ellipsis flowProgramSelector"
      aria-label="course search program selector"
      disabled={$selectedFlowIndex === -1}
      bind:value={searchProgramIndex}
    >
      {#if $selectedFlowIndex === -1}
        <option disabled value={-1}>Select a Flowchart</option>
      {/if}

      {#each $userFlowcharts[$selectedFlowIndex]?.programId || [] as _, i}
        <option value={i}>{createSearchFlowProgramSelectorFriendlyName(i)}</option>
      {/each}
    </select>
  </label>
</div>

<style lang="postcss">
  /* 91px is the width of the gray pill on the left */
  .flowProgramSelector {
    width: calc(100% - 91px);
  }
</style>
