<script lang="ts">
  import ProgramSelector from './ProgramSelector.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { Program } from '@prisma/client';

  const dispatch = createEventDispatcher();

  // passthrough props for ProgramSelector

  export let catalogYearsData: string[];
  export let programData: Program[];
  export let programIdInput: string;
  export let alreadySelectedProgramIds: string[];
  export let defaultOptionText = 'Choose ...';
  export let disableSelectingDefaultOption = true;

  // customization props
  export let i: number;
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
    {catalogYearsData}
    {programData}
    {programIdInput}
    {alreadySelectedProgramIds}
    {defaultOptionText}
    {disableSelectingDefaultOption}
    on:programIdUpdate={(e) => dispatch('programIdUpdate', e.detail)}
  />
</div>
