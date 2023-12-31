<script lang="ts">
  import Fa from 'svelte-fa';
  import { Toggle } from '$lib/components/common';
  import { faSortDown } from '@fortawesome/free-solid-svg-icons';
  import { userFlowcharts } from '$lib/client/stores/userDataStore';
  import { FLOW_TERM_COUNT_MAX } from '$lib/common/config/flowDataConfig';
  import {
    FlowInfoPanelActionsGeneratePDF,
    FlowInfoPanelActionsColorSelector
  } from '$lib/components/Flows/FlowInfoPanel';
  import {
    duplicateFlowchart,
    colorSelectedCourses,
    deleteSelectedCourses
  } from '$lib/client/util/flowActionsUtil';
  import {
    selectedColor,
    selectedCourses,
    viewingCreditBin,
    selectedFlowIndex
  } from '$lib/client/stores/UIDataStore';
  import {
    addTermsModalOpen,
    deleteTermsModalOpen,
    customizeCoursesModalOpen,
    editFlowPropertiesModalOpen
  } from '$lib/client/stores/modalStateStore';

  export let actionsButtonDisabled: boolean;

  // add one for credit bin term in flowcharts
  $: disableAddTerms =
    $userFlowcharts[$selectedFlowIndex]?.termData.length === FLOW_TERM_COUNT_MAX + 1;
  $: disableDeleteTerms = $userFlowcharts[$selectedFlowIndex]?.termData.length === 1;
</script>

<div class="dropdown">
  <!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label
    tabindex="0"
    role="button"
    class="flex-1 gap-0 btn btn-almostmd border-none text-white bg-gray-400 hover:bg-gray-500"
    class:btn-disabled={actionsButtonDisabled}
    aria-disabled={actionsButtonDisabled}
  >
    Actions
    <span class="ml-1 mb-1">
      <Fa icon={faSortDown} />
    </span>
  </label>

  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <ul
    tabindex="0"
    class="mt-1 p-2 shadow menu menu-compact dropdown-content bg-base-100 w-60 z-[1]"
  >
    <li>
      <a
        href={'#'}
        class:a-disabled={actionsButtonDisabled || disableAddTerms}
        aria-disabled={actionsButtonDisabled || disableAddTerms}
        on:click|preventDefault={() => ($addTermsModalOpen = true)}>Add Terms</a
      >
    </li>
    <li>
      <a
        href={'#'}
        class:a-disabled={actionsButtonDisabled || disableDeleteTerms}
        aria-disabled={actionsButtonDisabled || disableDeleteTerms}
        on:click|preventDefault={() => ($deleteTermsModalOpen = true)}>Remove Terms</a
      >
    </li>
    <li>
      <a
        href={'#'}
        class:a-disabled={actionsButtonDisabled}
        aria-disabled={actionsButtonDisabled}
        on:click|preventDefault={() => ($editFlowPropertiesModalOpen = true)}
        >Edit Flow Properties</a
      >
    </li>
    <li>
      <a
        href={'#'}
        class:a-disabled={actionsButtonDisabled}
        aria-disabled={actionsButtonDisabled}
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
    <li>
      <a
        href={'#'}
        class:a-disabled={actionsButtonDisabled || !$selectedCourses.size}
        aria-disabled={actionsButtonDisabled || !$selectedCourses.size}
        on:click|preventDefault={() => {
          $selectedCourses.clear();
          $selectedCourses = $selectedCourses;
        }}>Clear Course Selections</a
      >
    </li>
    <li>
      <FlowInfoPanelActionsColorSelector
        disabled={actionsButtonDisabled || !$selectedCourses.size}
      />
    </li>
    <li>
      <a
        href={'#'}
        class:a-disabled={actionsButtonDisabled || !$selectedCourses.size}
        aria-disabled={actionsButtonDisabled || !$selectedCourses.size}
        on:click|preventDefault={() => {
          deleteSelectedCourses(
            $userFlowcharts[$selectedFlowIndex]?.id,
            $userFlowcharts[$selectedFlowIndex]?.termData,
            $selectedCourses
          );
        }}>Delete Selected Courses</a
      >
    </li>
    <li>
      <a
        href={'#'}
        class:a-disabled={actionsButtonDisabled || !$selectedCourses.size}
        aria-disabled={actionsButtonDisabled || !$selectedCourses.size}
        on:click|preventDefault={() => {
          colorSelectedCourses(
            $userFlowcharts[$selectedFlowIndex]?.id,
            $userFlowcharts[$selectedFlowIndex]?.termData,
            $selectedCourses,
            $selectedColor
          );
        }}>Colorize Selected Courses</a
      >
    </li>
    <li>
      <a
        href={'#'}
        class:a-disabled={actionsButtonDisabled || !$selectedCourses.size}
        aria-disabled={actionsButtonDisabled || !$selectedCourses.size}
        on:click|preventDefault={() => ($customizeCoursesModalOpen = true)}>Edit Selected Courses</a
      >
    </li>
    <div class="divider my-0 py-0 px-2" />
    <li>
      <a
        href={'#'}
        class:a-disabled={actionsButtonDisabled}
        aria-disabled={actionsButtonDisabled}
        on:click|preventDefault={() => {
          duplicateFlowchart($userFlowcharts[$selectedFlowIndex], $userFlowcharts.length);
        }}>Duplicate Flow</a
      >
    </li>
    <FlowInfoPanelActionsGeneratePDF disabled={actionsButtonDisabled} />
  </ul>
</div>
