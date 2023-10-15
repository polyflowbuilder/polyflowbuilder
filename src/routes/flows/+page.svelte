<script lang="ts">
  // TODO: put these styles in a better place?
  import 'tippy.js/dist/tippy.css';
  import 'tippy.js/themes/light-border.css';
  import { ObjectSet } from '$lib/common/util/ObjectSet';
  import { FlowViewer } from '$lib/components/Flows';
  import { ModalWrapper } from '$lib/components/Flows/modals';
  import { FlowInfoPanel } from '$lib/components/Flows/FlowInfoPanel';
  import { userFlowcharts } from '$lib/client/stores/userDataStore';
  import {
    selectedCourses,
    viewingCreditBin,
    selectedFlowIndex
  } from '$lib/client/stores/UIDataStore';
  import {
    courseCache,
    programCache,
    availableFlowchartCatalogs,
    availableFlowchartStartYears
  } from '$lib/client/stores/apiDataStore';
  import type { PageData } from './$types';

  export let data: PageData;

  // init data brought down from server

  // user flowcharts
  userFlowcharts.set(data.userData.flowcharts);

  // API data
  availableFlowchartCatalogs.init(data.flowchartCatalogs);
  availableFlowchartStartYears.init(data.flowchartStartYears);

  // API data caches
  courseCache.set(
    // deserialize course cache
    new Map(
      data.userData.courseCache.map(([catalog, courses]) => {
        return [catalog, new ObjectSet((crs) => crs.id, courses)];
      })
    )
  );
  programCache.set(data.userData.programMetadata);

  // init local stores
  $: selectedFlowchart = $selectedFlowIndex !== -1 ? $userFlowcharts[$selectedFlowIndex] : null;

  // TODO: move this logic into the FlowEditor?
  $: {
    $selectedFlowIndex;
    clearSelectedCourses();
  }
  function clearSelectedCourses() {
    $selectedCourses.clear();
    $selectedCourses = $selectedCourses;
  }
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
