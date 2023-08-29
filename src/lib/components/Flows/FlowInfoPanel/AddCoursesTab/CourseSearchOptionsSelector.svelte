<script lang="ts">
  import { userFlowcharts } from '$lib/client/stores/userDataStore';
  import { flowListUIData, selectedFlowIndex } from '$lib/client/stores/UIDataStore';

  export let searchProgramIndex = -1;
  export let query = '';
  export let field = '';

  // TODO: if we don't have a concentration, don't include it in the friendly name
  function createSearchFlowProgramSelectorFriendlyName(i: number) {
    const displayInfoObj = $flowListUIData[$selectedFlowIndex].displayInfo[i];
    const displayInfo = [displayInfoObj.catalog, displayInfoObj.majorName, displayInfoObj.concName];
    return displayInfo.join(' - ');
  }
</script>

<div>
  <!-- program selector -->
  <label class="join group-input group-input-sm">
    <span class="join-item">Program: </span>
    <select
      class="select join-item select-bordered select-sm overflow-ellipsis flowProgramSelector"
      aria-label="course search program selector"
      disabled={$selectedFlowIndex === -1}
      bind:value={searchProgramIndex}
    >
      {#if $selectedFlowIndex === -1}
        <option disabled value={-1}>Select a Flowchart</option>
      {/if}

      {#each $userFlowcharts[$selectedFlowIndex]?.programId ?? [] as _, i}
        <option value={i}>{createSearchFlowProgramSelectorFriendlyName(i)}</option>
      {/each}
    </select>
  </label>

  <!-- field selector -->
  <label class="mt-2 join group-input group-input-sm">
    <span class="join-item">Search On:</span>
    <select
      class="select join-item select-bordered select-sm overflow-ellipsis searchFieldSelector"
      aria-label="course search field selector"
      disabled={$selectedFlowIndex === -1}
      bind:value={field}
    >
      <option value="displayName">Course Name</option>
      <option value="id">Course ID</option>
    </select>
  </label>

  <!-- query input -->
  <input
    class="mt-2 input input-bordered input-sm w-full"
    aria-label="course search query input"
    role="searchbox"
    placeholder="Search for courses to add"
    bind:value={query}
    disabled={$selectedFlowIndex === -1}
  />
</div>

<style lang="postcss">
  /* 91px is the width of the gray pill on the left */
  .flowProgramSelector {
    width: calc(100% - 91px);
  }
  /* 104px is the width of the gray pill on the left */
  .searchFieldSelector {
    width: calc(100% - 104px);
  }

  .group-input-sm {
    font-size: 0.875rem; /* 14px */
    line-height: 2rem; /* 32px */
  }
</style>
