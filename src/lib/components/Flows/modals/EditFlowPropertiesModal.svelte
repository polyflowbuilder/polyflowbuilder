<script lang="ts">
  import FlowPropertiesSelector from '$lib/components/common/FlowPropertiesSelector';
  import { tick } from 'svelte';
  import { userFlowcharts } from '$lib/client/stores/userDataStore';
  import { selectedFlowIndex } from '$lib/client/stores/UIDataStore';
  import { MODAL_CLOSE_TIME_MS } from '$lib/client/config/uiConfig';
  import { FLOW_NOTES_MAX_LENGTH } from '$lib/common/config/flowDataConfig';
  import { UserDataUpdateChunkType } from '$lib/types';
  import { submitUserDataUpdateChunk } from '$lib/client/util/mutateUserDataUtilClient';
  import { editFlowPropertiesModalOpen } from '$lib/client/stores/modalStateStore';
  import { startYearsData, catalogYearsData, programData } from '$lib/client/stores/apiDataStore';
  import type { Flowchart } from '$lib/common/schema/flowchartSchema';

  // TODO: add support for editing programs

  let flowName = '';
  let flowStartYear = '';
  let flowProgramIdInputs = [''];
  let flowProgramIds = [''];
  let flowPropertiesValid = false;
  let flowNotes = '';

  $: selectedFlowchart = $userFlowcharts[$selectedFlowIndex];
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
    flowStartYear !== selectedFlowchart?.startYear ||
    selectedFlowchart?.programId.join(',') !== flowProgramIds.join(',') ||
    selectedFlowchart?.notes !== flowNotes;

  $: changesValid = changesMade && flowPropertiesValid;

  // use a FLOW_UPSERT_ALL update chunk instead of a more specific one
  // so that we can support program changes in the future
  function updateFlowchartProperties() {
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

    closeModal();
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
</script>

<div class="modal" class:modal-open={$editFlowPropertiesModalOpen} tabindex="-1">
  <div class="modal-box">
    <h2 class="text-3xl font-medium text-polyGreen text-center">Edit Flowchart Properties</h2>

    <div class="divider" />

    <FlowPropertiesSelector
      bind:flowName
      bind:flowStartYear
      startYearsData={$startYearsData}
      catalogYearsData={$catalogYearsData}
      programData={$programData}
      programIdInputs={flowProgramIdInputs}
      on:flowProgramIdsUpdate={(e) => (flowProgramIds = e.detail)}
      on:optionsValidUpdate={(e) => (flowPropertiesValid = e.detail)}
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
</div>

<style lang="postcss">
  .modal-box {
    max-width: 48rem;
  }
</style>
