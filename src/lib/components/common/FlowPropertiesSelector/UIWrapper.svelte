<script lang="ts">
  import ProgramSelector from './ProgramSelector.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    deleteProgram: number;
    programIdUpdate: string;
    fetchingDataUpdate: boolean;
  }>();

  // passthrough props for ProgramSelector

  export let programIdInput: string;
  export let alreadySelectedProgramIds: string[];
  export let defaultOptionText = 'Choose ...';
  export let disableSelectingDefaultOption = true;
  export let fetchingData: boolean;

  // customization props
  export let i: number;

  // TODO: cannot have typescript in markup, so need separate function with unknown type
  // see https://github.com/sveltejs/svelte/issues/4701
  // see https://stackoverflow.com/questions/63337868/svelte-typescript-unexpected-tokensvelteparse-error-when-adding-type-to-an-ev
  function programIdUpdateEventHandler(e: CustomEvent<string>) {
    dispatch('programIdUpdate', e.detail);
  }
  function fetchingDataUpdateEventHandler(e: CustomEvent<boolean>) {
    dispatch('fetchingDataUpdate', e.detail);
  }
</script>

<div class="border rounded-md bg-slate-50 border-base-300 p-2 mb-4">
  <div class="flex justify-between mb-2">
    {#if i === 0}
      <div class="infoBadge mt-[2px]">PRIMARY</div>
    {:else}
      <div class="warningBadge mt-[2px]">ADDITIONAL</div>
      <button class="btn btn-xs redButton" on:click={() => dispatch('deleteProgram', i)}
        >REMOVE</button
      >
    {/if}
  </div>
  <ProgramSelector
    {programIdInput}
    {alreadySelectedProgramIds}
    {defaultOptionText}
    {disableSelectingDefaultOption}
    {fetchingData}
    on:programIdUpdate={programIdUpdateEventHandler}
    on:fetchingDataUpdate={fetchingDataUpdateEventHandler}
  />
</div>
