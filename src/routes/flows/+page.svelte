<script lang="ts">
  // TODO: put these styles in a better place?
  import 'tippy.js/dist/tippy.css';
  import 'tippy.js/themes/light-border.css';
  import { FlowViewer } from '$lib/components/Flows';
  import { searchCache } from '$lib/client/stores/catalogSearchStore.js';
  import { ModalWrapper } from '$lib/components/Flows/modals';
  import { FlowInfoPanel } from '$lib/components/Flows/FlowInfoPanel';
  import { userFlowcharts } from '$lib/client/stores/userDataStore';
  import { availableFlowchartCatalogs, courseCache } from '$lib/client/stores/apiDataStore';
  import {
    selectedColor,
    selectedCourses,
    selectedFlowIndex,
    viewingCreditBin
  } from '$lib/client/stores/UIDataStore';
  import type { PageData } from './$types';

  export let data: PageData;

  // init data brought down from server
  userFlowcharts.set(data.userData.flowcharts);
  courseCache.set(data.userData.courseCache);

  // init local stores
  $: selectedFlowchart = $selectedFlowIndex !== -1 ? $userFlowcharts[$selectedFlowIndex] : null;
  $: $searchCache = $availableFlowchartCatalogs.map((catalog) => ({
    catalog,
    queries: []
  }));

  // TODO: move this logic into the FlowEditor?
  $: {
    $selectedFlowIndex;
    clearSelectedCourses();
  }
  function clearSelectedCourses() {
    $selectedCourses.clear();
    $selectedCourses = $selectedCourses;
  }

  $: console.log('selectedcourses', $selectedCourses);
  $: console.log('selectedcolor', $selectedColor);
</script>

<div class="flowContainer w-full flex">
  <FlowInfoPanel />
  <FlowViewer flowchart={selectedFlowchart} bind:displayCreditBin={$viewingCreditBin} />
</div>

<ModalWrapper />

<style lang="postcss">
  /* have the header and flow viewer content take up 100vh, not just the flow viewer */
  /* 90px is height of header & some extra added pixels so we see the bottom shadow of the flow container card */
  .flowContainer {
    min-height: calc(100vh - 90px);
    height: calc(100vh - 90px);
  }
</style>
