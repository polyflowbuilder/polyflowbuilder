<script lang="ts">
  import UIWrapper from './UIWrapper.svelte';
  import { createEventDispatcher } from 'svelte';
  import { FLOW_NAME_MAX_LENGTH, FLOW_PROGRAMS_MAX_COUNT } from '$lib/common/config/flowDataConfig';
  import type { Program } from '@prisma/client';

  const dispatch = createEventDispatcher();

  // component required data
  export let startYearsData: string[];
  export let catalogYearsData: string[];
  export let programData: Program[];

  // data props
  export let flowName: string;
  export let flowStartYear: string;
  // need to have dedicated input bc will enter reactive loop if
  // we try to have inputs and outputs be a single variable
  export let programIdInputs: string[];

  // customization props
  export let defaultOptionText = 'Choose ...';
  export let flowNamePlaceholderText = 'My New Flowchart';
  export let disableSelectingDefaultOption = true;

  // make sure output is a copy of the inputs whenever the inputs change
  $: flowProgramIds = programIdInputs;

  // emit events
  $: dispatch('optionsValidUpdate', flowPropertiesOptionsValid);
  $: dispatch('flowProgramIdsUpdate', flowProgramIds);

  // validation
  $: flowNameValid = flowName.length > 0 && flowName.length <= FLOW_NAME_MAX_LENGTH;
  $: flowPropertiesOptionsValid =
    flowNameValid && flowStartYear.length > 0 && !flowProgramIds.includes('');

  // do all updates through inputs to ensure UI is updated correctly
  async function addProgram() {
    programIdInputs = [...programIdInputs, ''];
  }
  async function deleteProgram(i: number) {
    programIdInputs = programIdInputs.filter((_, idx) => idx !== i);
  }
  // wrap this to prevent duplicate updates
  async function updateProgram(i: number, updatedProgramId: string) {
    if (flowProgramIds[i] !== updatedProgramId) {
      flowProgramIds[i] = updatedProgramId;
    }
  }
</script>

<div>
  <div class="mb-2">
    <div class="label">
      <span class="text-base">Flow Name:</span>
      <span
        class="text-sm"
        class:text-red-600={!flowNameValid}
        class:text-green-700={flowNameValid}
      >
        ({flowName.length}/{FLOW_NAME_MAX_LENGTH})
      </span>
    </div>
    <label>
      <span class="sr-only">Flow Name</span>
      <input
        class="input input-bordered input-sm w-full"
        name="flowName"
        type="text"
        placeholder={flowNamePlaceholderText}
        minlength="1"
        required
        bind:value={flowName}
      />
    </label>
  </div>

  <div class="mb-2">
    <div class="label">
      <span>Starting Year:</span>
    </div>
    <label>
      <span class="sr-only">Starting Year</span>
      <select
        class="select select-bordered select-sm font-medium w-full"
        name="flowStartYear"
        required
        bind:value={flowStartYear}
      >
        <option selected disabled={disableSelectingDefaultOption} value=""
          >{defaultOptionText}</option
        >
        {#each startYearsData as startYear}
          <option value={startYear}>{startYear}</option>
        {/each}
      </select>
    </label>
  </div>

  <div class="mb-2">
    <p class="label pb-0">Programs:</p>
    <div class="divider mt-0 mb-2" />

    {#each programIdInputs as flowProgramIdInput, i (`${flowProgramIdInput}_${i}`)}
      <UIWrapper
        {catalogYearsData}
        {programData}
        programIdInput={flowProgramIdInput}
        alreadySelectedProgramIds={programIdInputs.filter((id, j) => id && j !== i)}
        {i}
        on:programIdUpdate={(e) => updateProgram(i, e.detail)}
        on:deleteProgram={(e) => deleteProgram(e.detail)}
      />
    {/each}

    <div class="flex justify-end mt-4">
      <button
        class="btn btn-xs greenButton"
        disabled={programIdInputs.length === FLOW_PROGRAMS_MAX_COUNT}
        on:click={addProgram}
      >
        Add Program
      </button>
    </div>

    {#if programIdInputs.length === FLOW_PROGRAMS_MAX_COUNT}
      <small class="text-red-600 flex justify-center mt-4"
        >Max program count reached. If you need more for your flowchart, please reach out to us
        about your use case.</small
      >
    {/if}

    <div class="divider my-2" />
  </div>
</div>