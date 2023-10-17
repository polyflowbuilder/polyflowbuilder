<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  import {
    programCache,
    majorNameCache,
    concOptionsCache,
    availableFlowchartCatalogs
  } from '$lib/client/stores/apiDataStore';
  import type { Program } from '@prisma/client';
  import type { ConcOptionsCacheValue } from '$lib/types';

  const dispatch = createEventDispatcher<{
    programIdUpdate: string;
    fetchingDataUpdate: boolean;
  }>();

  // component inputs
  export let programIdInput: string;
  export let alreadySelectedProgramIds: string[];
  export let fetchingData: boolean;

  // customization props
  export let defaultOptionText = 'Choose ...';
  export let disableSelectingDefaultOption = true;

  // internal data variables
  let programCatalogYear = '';
  let programName = '';
  let programId = '';
  let updating = false;
  let majorOptions: string[] = [];
  let concOptions: ConcOptionsCacheValue[] = [];
  $: alreadySelectedMajorNames = alreadySelectedProgramIds.map((id) => {
    const majorName = $programCache.get(id)?.majorName;
    if (!majorName) {
      throw new Error('invalid program id in alreadySelectedProgramIds: ' + id);
    }
    return majorName;
  });

  // react to change in program input
  $: void updateInputs(programIdInput);

  // react to change in catalog year to fetch new major options
  $: if (programCatalogYear) {
    void loadMajorOptions(programCatalogYear);
  }
  // react to change in catalog and major to fetch new conc options
  $: if (programCatalogYear && programName) {
    void loadConcentrationOptions(programCatalogYear, programName);
  }

  // prevent dispatch during middle of updateInputs (ticking)
  $: if (!updating) {
    dispatch('programIdUpdate', programId);
  }

  async function updateInputs(input: string) {
    updating = true;
    if (input !== '') {
      // find the program if it's valid
      const program = $programCache.get(input);
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

  // load major and concentration options for UI
  async function loadMajorOptions(progCatalogYear: string) {
    let majorNameCacheEntry = $majorNameCache.get(progCatalogYear);

    // does not exist, fetch entries
    if (!majorNameCacheEntry) {
      dispatch('fetchingDataUpdate', true);
      const res = await fetch(`/api/data/queryAvailableMajors?catalog=${progCatalogYear}`);
      const resJson = (await res.json()) as {
        message: string;
        results: string[];
      };
      majorNameCache.update((cache) => {
        cache.set(progCatalogYear, resJson.results.sort());
        return cache;
      });
      majorNameCacheEntry = $majorNameCache.get(progCatalogYear);
      if (!majorNameCacheEntry) {
        throw new Error('loadMajorOptions: majorNameCacheEntry not found after fetch');
      }
      dispatch('fetchingDataUpdate', false);
    }

    // select
    majorOptions = majorNameCacheEntry;
  }
  async function loadConcentrationOptions(progCatalogYear: string, majorName: string) {
    // fetch programs for this program if we don't have them
    if (
      !$concOptionsCache.has({
        catalog: progCatalogYear,
        majorName
      })
    ) {
      dispatch('fetchingDataUpdate', true);
      const res = await fetch(
        `/api/data/queryAvailablePrograms?catalog=${progCatalogYear}&majorName=${majorName}`
      );
      const resJson = (await res.json()) as {
        message: string;
        results: Program[];
      };

      // update relevant caches
      programCache.update((cache) => {
        for (const entry of resJson.results) {
          cache.set(entry.id, entry);
        }
        return cache;
      });
      concOptionsCache.update((cache) => {
        cache.set(
          {
            catalog: progCatalogYear,
            majorName
          },
          resJson.results
            .map((entry) => {
              if (!entry.concName) {
                throw new Error(`loadConcentrationOptions: program ${entry.id} has no concName`);
              }
              return {
                name: entry.concName,
                id: entry.id
              };
            })
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        return cache;
      });

      dispatch('fetchingDataUpdate', false);
    }

    // select
    const concOptionsCacheEntry = $concOptionsCache.get({
      catalog: progCatalogYear,
      majorName
    });
    if (!concOptionsCacheEntry) {
      throw new Error(
        `loadConcentrationOptions: concOptionsCacheEntry empty for entry ${{
          catalog: progCatalogYear,
          majorName
        }}`
      );
    }
    concOptions = concOptionsCacheEntry;
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
        disabled={fetchingData}
        required
        bind:value={programCatalogYear}
      >
        <option selected disabled={disableSelectingDefaultOption} value=""
          >{defaultOptionText}</option
        >
        {#each $availableFlowchartCatalogs as catalogYear}
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
        disabled={fetchingData}
        required
        bind:value={programName}
      >
        <option selected disabled={disableSelectingDefaultOption} value=""
          >{defaultOptionText}</option
        >
        {#if programCatalogYear}
          {#each majorOptions as major}
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
        disabled={fetchingData}
        required
        bind:value={programId}
      >
        <option selected disabled={disableSelectingDefaultOption} value=""
          >{defaultOptionText}</option
        >
        {#if programName}
          {#each concOptions as concentration}
            <option value={concentration.id}>{concentration.name}</option>
          {/each}
        {/if}
      </select>
    </label>
  </div>
</div>
