<script lang="ts">
  import FlowPropertiesSelector from '$lib/components/common/FlowPropertiesSelector';
  import { tick } from 'svelte';
  import { modal } from '$lib/client/util/modalUtil';
  import { userFlowcharts } from '$lib/client/stores/userDataStore';
  import { selectedFlowIndex } from '$lib/client/stores/UIDataStore';
  import { MODAL_CLOSE_TIME_MS } from '$lib/client/config/uiConfig';
  import { FLOW_NOTES_MAX_LENGTH } from '$lib/common/config/flowDataConfig';
  import { UserDataUpdateChunkType } from '$lib/types';
  import { submitUserDataUpdateChunk } from '$lib/client/util/mutateUserDataUtilClient';
  import { editFlowPropertiesModalOpen } from '$lib/client/stores/modalStateStore';
  import {
    programCache,
    availableFlowchartCatalogs,
    availableFlowchartStartYears
  } from '$lib/client/stores/apiDataStore';
  import type { Flowchart } from '$lib/common/schema/flowchartSchema';

  // TODO: add support for editing programs

  let flowName = '';
  let flowStartYear = '';
  let flowProgramIdInputs = [''];
  let flowProgramIds = [''];
  let flowPropertiesValid = false;
  let flowNotes = '';

  // add the optional type bc not inferred
  $: selectedFlowchart = $userFlowcharts[$selectedFlowIndex] as Flowchart | undefined;
  $: onFlowchartChange(selectedFlowchart);

  function onFlowchartChange(flowchart: Flowchart | undefined) {
    flowName = flowchart?.name ?? '';
    flowStartYear = flowchart?.startYear ?? '';
    // TODO: investigate why we need a deep clone here -- if we don't have this
    // and we change the program ID (without saving), exit, switch to another
    // flowchart, and back to the original one, flowchart?.programId is
    // CORRUPTED IN THE STORE! super weird
    flowProgramIdInputs = structuredClone(flowchart?.programId) ?? [''];

    flowNotes = flowchart?.notes ?? '';
  }

  $: changesMade =
    flowName !== selectedFlowchart?.name ||
    flowStartYear !== selectedFlowchart.startYear ||
    selectedFlowchart.programId.join(',') !== flowProgramIds.join(',') ||
    selectedFlowchart.notes !== flowNotes;

  $: changesValid = changesMade && flowPropertiesValid;

  // use a FLOW_UPSERT_ALL update chunk instead of a more specific one
  // so that we can support program changes in the future
  function updateFlowchartProperties() {
    if (!selectedFlowchart) {
      throw new Error('selectedFlowchart undefined on updateFlowchartProperties');
    }

    const newFlowchart = structuredClone(selectedFlowchart);
    newFlowchart.name = flowName;
    newFlowchart.startYear = flowStartYear;
    newFlowchart.notes = flowNotes;

    submitUserDataUpdateChunk({
      type: UserDataUpdateChunkType.FLOW_UPSERT_ALL,
      data: {
        flowchart: newFlowchart,
        pos: $selectedFlowIndex
      }
    });

    void closeModal();
  }

  async function closeModal() {
    $editFlowPropertiesModalOpen = false;

    // wait for closing animation before resetting values
    await new Promise((r) => setTimeout(r, MODAL_CLOSE_TIME_MS));

    // need to empty arr and tick so that all elements in programselector are destroyed
    // before setting it to the default value
    flowProgramIdInputs = [''];
    await tick();

    onFlowchartChange($userFlowcharts[$selectedFlowIndex]);
  }

  // TODO: cannot have typescript in markup, so need separate function with unknown type
  // see https://github.com/sveltejs/svelte/issues/4701
  // see https://stackoverflow.com/questions/63337868/svelte-typescript-unexpected-tokensvelteparse-error-when-adding-type-to-an-ev
  function flowProgramIdsUpdateEventHandler(e: CustomEvent<string[]>) {
    flowProgramIds = e.detail;
  }
  function optionsValidUpdateEventHandler(e: CustomEvent<boolean>) {
    flowPropertiesValid = e.detail;
  }
</script>

<dialog use:modal={editFlowPropertiesModalOpen} class="modal">
  <div class="modal-box">
    <h2 class="text-3xl font-medium text-polyGreen text-center">Edit Flowchart Properties</h2>

    <div class="divider" />

    <!-- TODO: implement updating flowchart programs -->
    <FlowPropertiesSelector
      bind:flowName
      bind:flowStartYear
      exposeProgramSelector={false}
      programIdInputs={flowProgramIdInputs}
      on:flowProgramIdsUpdate={flowProgramIdsUpdateEventHandler}
      on:optionsValidUpdate={optionsValidUpdateEventHandler}
    />

    <div class="label">
      <span class="label-text text-base">Flow Notes:</span>
      <span
        class="text-sm"
        class:text-red-600={flowNotes.length > FLOW_NOTES_MAX_LENGTH}
        class:text-green-700={flowNotes.length <= FLOW_NOTES_MAX_LENGTH}
      >
        ({flowNotes.length}/{FLOW_NOTES_MAX_LENGTH})
      </span>
    </div>
    <label>
      <span class="sr-only">Flow Notes:</span>
      <textarea
        class="textarea textarea-bordered textarea-sm w-full h-40 resize-none"
        name="editFlowNotes"
        placeholder="My Flowchart Notes"
        bind:value={flowNotes}
      />
    </label>

    <div class="flex mt-4">
      <button
        class="btn btn-almostmd btn-accent flex-1"
        disabled={!changesValid}
        on:click={updateFlowchartProperties}>Save Changes</button
      >
      <div class="divider divider-horizontal" />
      <button class="btn btn-almostmd flex-1" on:click={closeModal}>Cancel</button>
    </div>
  </div>
</dialog>

<style lang="postcss">
  .modal-box {
    max-width: 48rem;
  }
</style>
