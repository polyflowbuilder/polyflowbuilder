<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  import type { Program } from '@prisma/client';

  const dispatch = createEventDispatcher();

  // external data props

  // component required data
  export let catalogYearsData: string[];
  export let programData: Program[];

  // component inputs
  export let programIdInput: string;
  export let alreadySelectedProgramIds: string[];

  // customization props
  export let defaultOptionText = 'Choose ...';
  export let disableSelectingDefaultOption = true;

  // internal data variables
  let programCatalogYear = '';
  let programName = '';
  let programId = '';
  let updating = false;
  $: alreadySelectedMajorNames = alreadySelectedProgramIds.map((id) => {
    const majorName = programData.find((prog) => prog.id === id)?.majorName;
    if (!majorName) {
      throw new Error('invalid program id in alreadySelectedProgramIds: ' + id);
    }
    return majorName;
  });

  // react to change in program input
  $: updateInputs(programIdInput);

  // prevent dispatch during middle of updateInputs (ticking)
  $: if (!updating) {
    dispatch('programIdUpdate', programId);
  }

  async function updateInputs(input: string) {
    updating = true;
    if (input !== '') {
      // find the program if it's valid
      const program = programData.find((prog) => prog.id === input);
      if (!program) {
        throw new Error('invalid program received as input: ' + input);
      }
      // need to tick to update selectors in UI
      programCatalogYear = program.catalog;
      await tick();
      programName = program.majorName;
      await tick();
    } else {
      programCatalogYear = '';
      programName = '';
    }

    programId = input;
    updating = false;
  }

  // generate major and concentration options for UI
  function buildMajorOptions(progCatalogYear: string) {
    const majors: string[] = [];
    programData.forEach((progData) => {
      if (progData.catalog === progCatalogYear) {
        majors.push(progData.majorName);
      }
    });

    // dedupe
    return [...new Set(majors.sort())];
  }
  function buildConcentrationOptions(progCatalogYear: string, majorName: string) {
    const concentrationList: Array<{
      name: string;
      id: string;
    }> = [];
    programData.forEach((progData) => {
      if (
        progData.catalog === progCatalogYear &&
        progData.majorName === majorName &&
        // bc may be null - won't be null in this case but could be (eg for minors)
        progData.concName
      ) {
        concentrationList.push({
          name: progData.concName,
          id: progData.id
        });
      }
    });

    return concentrationList.sort((a, b) => a.name.localeCompare(b.name));
  }

  // reset the major & concentration when their respective parents change
  $: {
    programCatalogYear;
    programName = '';
  }
  $: {
    programName;
    programId = '';
  }
</script>

<div>
  <div class="mb-2">
    <label class="join group-input">
      <span class="join-item min-w-[8rem] w-32">Catalog</span>
      <select
        class="select join-item font-medium select-sm select-bordered flex-1 overflow-hidden overflow-ellipsis"
        name="programCatalogYear"
        required
        bind:value={programCatalogYear}
      >
        <option selected disabled={disableSelectingDefaultOption} value=""
          >{defaultOptionText}</option
        >
        {#each catalogYearsData as catalogYear}
          <option value={catalogYear}>{catalogYear}</option>
        {/each}
      </select>
    </label>
  </div>

  <div class="mb-2">
    <label class="join group-input">
      <span class="join-item min-w-[8rem] w-32">Major</span>
      <select
        class="select join-item font-medium select-sm select-bordered flex-1 overflow-hidden overflow-ellipsis"
        name="programName"
        required
        bind:value={programName}
      >
        <option selected disabled={disableSelectingDefaultOption} value=""
          >{defaultOptionText}</option
        >
        {#if programCatalogYear}
          {#each buildMajorOptions(programCatalogYear) as major}
            <option disabled={alreadySelectedMajorNames.includes(major)} value={major}
              >{major}</option
            >
          {/each}
        {/if}
      </select>
    </label>
  </div>

  <div class="mb-2">
    <label class="join group-input">
      <span class="join-item min-w-[8rem] w-32">Concentration</span>
      <select
        class="select join-item font-medium select-sm select-bordered flex-1 overflow-hidden overflow-ellipsis"
        name="programAddlName"
        required
        bind:value={programId}
      >
        <option selected disabled={disableSelectingDefaultOption} value=""
          >{defaultOptionText}</option
        >
        {#if programName}
          {#each buildConcentrationOptions(programCatalogYear, programName) as concentration}
            <option value={concentration.id}>{concentration.name}</option>
          {/each}
        {/if}
      </select>
    </label>
  </div>
</div>