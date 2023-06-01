<script lang="ts">
  import Fa from 'svelte-fa';
  import { Toggle } from '$lib/components/common';
  import { faSortDown } from '@fortawesome/free-solid-svg-icons';
  import { userFlowcharts } from '$lib/client/stores/userDataStore';
  import { FlowInfoPanelActionsColorSelector } from '$lib/components/Flows/FlowInfoPanel';
  import { colorSelectedCourses, deleteSelectedCourses } from '$lib/client/util/flowActionsUtil';
  import {
    selectedCourses,
    viewingCreditBin,
    selectedFlowIndex,
    selectedColor
  } from '$lib/client/stores/UIDataStore';
  import {
    addTermsModalOpen,
    deleteTermsModalOpen,
    editFlowPropertiesModalOpen
  } from '$lib/client/stores/modalStateStore';

  export let actionsButtonDisabled: boolean;
</script>

<div class="dropdown">
  <button
    tabindex="0"
    class="flex-1 mx-1 btn btn-almostmd bg-gray-400 border-none hover:bg-gray-500"
    disabled={actionsButtonDisabled}
  >
    Actions
    <span class="ml-1 mb-1">
      <Fa icon={faSortDown} />
    </span>
  </button>

  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <ul tabindex="0" class="mt-1 p-2 shadow menu menu-compact dropdown-content bg-base-100 w-60">
    <li><a href={'#'} on:click|preventDefault={() => ($addTermsModalOpen = true)}>Add Terms</a></li>
    <li>
      <a href={'#'} on:click|preventDefault={() => ($deleteTermsModalOpen = true)}>Remove Terms</a>
    </li>
    <li>
      <a href={'#'} on:click|preventDefault={() => ($editFlowPropertiesModalOpen = true)}
        >Edit Flow Properties</a
      >
    </li>
    <li>
      <a
        href={'#'}
        on:click|preventDefault={() => ($viewingCreditBin = !$viewingCreditBin)}
        class="relative"
      >
        <span>View Credit Bin</span>
        <span class="absolute right-0 top-[6px]">
          <Toggle name={'View Credit Bin'} bind:checked={$viewingCreditBin} />
        </span>
      </a>
    </li>
    <div class="divider my-0 py-0 px-2" />
    <li class="text-gray-400 pointer-events-none">
      <div>
        {$selectedCourses.size}
        {$selectedCourses.size === 1 ? 'course' : 'courses'} selected
      </div>
    </li>
    <li class:disabled={!$selectedCourses.size} class:pointer-events-none={!$selectedCourses.size}>
      <a
        href={'#'}
        on:click|preventDefault={() => {
          $selectedCourses.clear();
          $selectedCourses = $selectedCourses;
        }}>Clear Course Selections</a
      >
    </li>
    <li class:disabled={!$selectedCourses.size} class:pointer-events-none={!$selectedCourses.size}>
      <FlowInfoPanelActionsColorSelector />
    </li>
    <li class:disabled={!$selectedCourses.size} class:pointer-events-none={!$selectedCourses.size}>
      <a
        href={'#'}
        on:click|preventDefault={() =>
          deleteSelectedCourses(
            $userFlowcharts[$selectedFlowIndex]?.id,
            $userFlowcharts[$selectedFlowIndex]?.termData,
            $selectedCourses
          )}>Delete Selected Courses</a
      >
    </li>
    <li class:disabled={!$selectedCourses.size} class:pointer-events-none={!$selectedCourses.size}>
      <a
        href={'#'}
        on:click|preventDefault={() =>
          colorSelectedCourses(
            $userFlowcharts[$selectedFlowIndex]?.id,
            $userFlowcharts[$selectedFlowIndex]?.termData,
            $selectedCourses,
            $selectedColor
          )}>Colorize Selected Courses</a
      >
    </li>
  </ul>
</div>
