<script lang="ts">
  import Fa from 'svelte-fa';
  import { userFlowcharts } from '$lib/client/stores/userDataStore';
  import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
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
  <div class="flex">
    <label class="join group-input group-input-xs">
      <span class="join-item">Program: </span>
      <select
        class="select join-item select-bordered select-xs overflow-ellipsis flowProgramSelector"
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
    <div class="ml-1 mt-1 text-blue-500">
      <Fa icon={faQuestionCircle} />
    </div>
  </div>

  <!-- field selector -->
  <div class="mt-2 flex">
    <label class="join group-input group-input-xs">
      <span class="join-item">Search On:</span>
      <select
        class="select join-item select-bordered select-xs overflow-ellipsis searchFieldSelector"
        aria-label="course search field selector"
        disabled={$selectedFlowIndex === -1}
        bind:value={field}
      >
        <option value="displayName">Course Name</option>
        <option value="id">Course ID</option>
      </select>
    </label>
    <div class="ml-1 mt-1 text-blue-500">
      <Fa icon={faQuestionCircle} />
    </div>
  </div>

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
  /* pixel counts are the width of the gray pill on the left */
  .flowProgramSelector {
    width: calc(100% - 83px);
  }
  .searchFieldSelector {
    width: calc(100% - 93px);
  }

  .group-input-xs {
    font-size: 0.75rem; /* 12px */
    line-height: 1rem; /* 16px */
  }
</style>
