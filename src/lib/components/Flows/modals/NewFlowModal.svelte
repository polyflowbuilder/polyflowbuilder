<script lang="ts">
  import FlowPropertiesSelector from '$lib/components/common/FlowPropertiesSelector';
  import { tick } from 'svelte';
  import { Toggle } from '$lib/components/common';
  import { newFlowModalOpen } from '$lib/client/stores/modalStateStore';
  import type { Program } from '@prisma/client';

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
  async function closeModal() {
    $newFlowModalOpen = false;

    // wait for closing animation before resetting values
    await new Promise((r) => setTimeout(r, 100));
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

<div class="modal" class:modal-open={$newFlowModalOpen} tabindex="-1">
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
        class:loading
        disabled={!createFlowOptionsValid}>Create</button
      >
      <div class="divider divider-horizontal" />
      <button class="btn btn-almostmd flex-1" disabled={loading} on:click={closeModal}>
        Cancel
      </button>
    </div>
  </div>
</div>

<style lang="postcss">
  /* expand modal size */
  .modal-box {
    max-width: 48rem;
  }
</style>
