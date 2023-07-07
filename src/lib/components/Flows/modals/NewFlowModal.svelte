<script lang="ts">
  import FlowPropertiesSelector from '$lib/components/common/FlowPropertiesSelector';
  import { tick } from 'svelte';
  import { modal } from '$lib/client/util/modalUtil';
  import { Toggle } from '$lib/components/common';
  import { courseCache } from '$lib/client/stores/apiDataStore';
  import { userFlowcharts } from '$lib/client/stores/userDataStore';
  import { newFlowModalOpen } from '$lib/client/stores/modalStateStore';
  import { selectedFlowIndex } from '$lib/client/stores/UIDataStore';
  import { MODAL_CLOSE_TIME_MS } from '$lib/client/config/uiConfig';
  import { UserDataUpdateChunkType } from '$lib/types';
  import { submitUserDataUpdateChunk } from '$lib/client/util/mutateUserDataUtilClient';
  import { UPDATE_CHUNK_DELAY_TIME_MS } from '$lib/client/config/editorConfig';
  import type { Program } from '@prisma/client';
  import type { Flowchart } from '$lib/common/schema/flowchartSchema';
  import type { CourseCache } from '$lib/types';

  // component required data
  export let startYearsData: string[];
  export let catalogYearsData: string[];
  export let programData: Program[];

  // data props

  // input
  let flowName = '';
  let flowStartYear = '';
  let programIdInputs = [''];

  // output
  let createFlowOptionsValid = false;
  let programIds: string[] = [''];

  // customization
  let removeGECourses = false;

  // UI state
  let loading = false;

  async function createFlowchart() {
    let reqSuccess = true;

    if (loading) {
      return;
    }

    loading = true;

    const payload = {
      name: flowName,
      startYear: flowStartYear,
      programIds: programIds.join(','),
      removeGECourses: String(removeGECourses)
    };
    const searchParams = new URLSearchParams(payload);
    const res: {
      generatedFlowchart: Flowchart;
      courseCache: CourseCache[];
    } = await fetch(`/api/data/generateFlowchart?${searchParams.toString()}`).then((resp) => {
      switch (resp.status) {
        case 200:
          return resp.json();
        case 401:
          alert(
            'The request to create a new flowchart was unauthenticated. Please refresh the page and try again.'
          );
          reqSuccess = false;
          break;
        default:
          alert(
            'An error occurred while trying to create a new flowchart. Please refresh the page, and submit a bug report if this error persists.'
          );
          reqSuccess = false;
          break;
      }
      return;
    });
    if (reqSuccess) {
      // TODO: empty flowchart case
      const newCourseCache = $courseCache;
      res.courseCache.forEach((courseCacheEntry, i) => {
        // TODO: optimize by making course cache a set!
        newCourseCache[i].courses = Array.from(
          new Set([...newCourseCache[i].courses, ...courseCacheEntry.courses])
        );
      });
      $courseCache = newCourseCache;

      // persist creation update
      submitUserDataUpdateChunk({
        type: UserDataUpdateChunkType.FLOW_UPSERT_ALL,
        data: {
          flowchart: res.generatedFlowchart,
          pos: $userFlowcharts.length
        }
      });

      // select the flowchart
      // need to do timeout since the updates are applied after chunk delay time
      setTimeout(() => {
        $selectedFlowIndex = $userFlowcharts.length - 1;
      }, UPDATE_CHUNK_DELAY_TIME_MS);

      // close modal on success
      closeModal();
    }

    loading = false;
  }

  async function closeModal() {
    $newFlowModalOpen = false;

    // wait for closing animation before resetting values
    await new Promise((r) => setTimeout(r, MODAL_CLOSE_TIME_MS));
    flowName = '';
    flowStartYear = '';
    removeGECourses = false;

    // need to empty arr and tick so that all elements in programselector are destroyed
    // before setting it to the default value
    programIdInputs = [];
    await tick();
    programIdInputs = [''];
  }
</script>

<dialog use:modal={newFlowModalOpen} class="modal">
  <div class="modal-box">
    <h2 class="text-3xl font-medium text-polyGreen text-center">Create New Flowchart</h2>

    <div class="divider" />

    <div class="form-control">
      <FlowPropertiesSelector
        bind:flowName
        bind:flowStartYear
        {startYearsData}
        {catalogYearsData}
        {programData}
        {programIdInputs}
        on:flowProgramIdsUpdate={(e) => (programIds = e.detail)}
        on:optionsValidUpdate={(e) => (createFlowOptionsValid = e.detail)}
      />

      <h3 class="select-none">Flow Generation Options:</h3>

      <div class="label">
        <span class="label-text">Remove GE Courses in Template</span>
        <Toggle name={'Remove GE Courses'} bind:checked={removeGECourses} />
      </div>
    </div>

    <div class="flex mt-4">
      <button
        class="btn btn-almostmd btn-accent flex-1"
        disabled={!createFlowOptionsValid}
        on:click={createFlowchart}
      >
        <span class={loading ? 'loading loading-spinner' : ''}/>
        Create
      </button>
      <div class="divider divider-horizontal" />
      <button class="btn btn-almostmd flex-1" disabled={loading} on:click={closeModal}>
        Cancel
      </button>
    </div>
  </div>
</dialog>

<style lang="postcss">
  /* expand modal size */
  .modal-box {
    max-width: 48rem;
  }
</style>
