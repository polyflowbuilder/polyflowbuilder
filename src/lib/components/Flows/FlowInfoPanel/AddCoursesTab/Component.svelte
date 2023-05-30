<script lang="ts">
  import CourseItem from '../../FlowEditor/CourseItem.svelte';
  import MutableForEachContainer from '$lib/components/common/MutableForEachContainer.svelte';
  import CourseSearchProgramSelector from './CourseSearchProgramSelector.svelte';
  import { initSearch } from '$lib/client/util/courseSearchUtil';
  import { userFlowcharts } from '$lib/client/stores/userDataStore';
  import { selectedFlowIndex } from '$lib/client/stores/UIDataStore';
  import { COURSE_ITEM_SIZE_PX } from '$lib/client/config/uiConfig';
  import { courseCache, programData } from '$lib/client/stores/apiDataStore';
  import { buildTermCourseItemsData } from '$lib/client/util/courseItemUtil';
  import { getCatalogFromProgramIDIndex } from '$lib/common/util/courseDataUtilCommon';
  import { MAX_SEARCH_RESULTS_RETURN_COUNT } from '$lib/common/config/catalogSearchConfig';
  import { activeSearchResults, searchCache } from '$lib/client/stores/catalogSearchStore';
  import type { CourseItemData } from '$lib/types';

  let searchProgramIndex = -1;
  let query = '';
  let items: CourseItemData[] = [];

  // reset searches when we switch flows
  $: {
    $selectedFlowIndex;
    query = '';
    searchProgramIndex = $selectedFlowIndex !== -1 ? 0 : -1;
  }

  $: selectedCatalog = getCatalogFromProgramIDIndex(
    searchProgramIndex,
    $userFlowcharts[$selectedFlowIndex]?.programId || '',
    $programData
  );
  $: {
    if (selectedCatalog) {
      initSearch(query, selectedCatalog);
    }
  }

  // getting results from search
  $: $activeSearchResults?.then((results) => {
    items = buildTermCourseItemsData(
      $userFlowcharts[$selectedFlowIndex].programId,
      $courseCache,
      $programData,
      {
        // TODO: remove magic number
        tIndex: -2,
        courses: results.searchResults.map((result) => {
          return {
            ...result,
            programIdIndex: searchProgramIndex,
            color: '#FFFFFF'
          };
        }),
        // filler value, doesn't matter here
        tUnits: '0'
      }
    );
  });

  // TODO: would rather prevent people from dragging around search results
  // in the search container, but this is the next best option
  // TODO: search list gets replenished when we move a course from
  // the search area into a flow -- this is cool, but figure out why this happens!
  function onSearchItemsReorder(event: CustomEvent<CourseItemData[]>) {
    items = event.detail;
  }
</script>

<!-- TODO: add "template classes" like blanks and GEs here -->
<div class="flex flex-col h-full">
  <h2 class="text-4xl font-medium text-polyGreen text-center">Add Courses</h2>

  <div class="mt-4">
    <CourseSearchProgramSelector bind:searchProgramIndex />

    <input
      class="mt-4 input input-bordered input-sm w-full"
      aria-label="course search query input"
      role="searchbox"
      placeholder="Search for courses to add"
      bind:value={query}
      disabled={$selectedFlowIndex === -1}
    />
  </div>

  <!-- TODO: divider moves up slightly when course results are rendered, fix this -->
  <div class="divider my-4" />

  <div class="text-center overflow-y-scroll mb-3">
    {#await $activeSearchResults}
      <div class="searchSpinner" />
    {:then results}
      <!-- TODO: redo logic for when to show results, a bit funky looking in the UI -->
      {#if results && searchProgramIndex !== -1 && $searchCache
          .find((entry) => entry.catalog === selectedCatalog)
          ?.queries.includes(query)}
        {#if results.searchResults.length === 0}
          <small class="text-gray-500">No results found - please try a different search.</small>
        {:else}
          <MutableForEachContainer
            {items}
            component={CourseItem}
            dndType="termContainer"
            dropFromOthersDisabled={true}
            on:itemsReorder={onSearchItemsReorder}
            itemStyle="width: {COURSE_ITEM_SIZE_PX}px; height: {COURSE_ITEM_SIZE_PX}px; margin: 0.5rem auto;"
            containerStyle="display: grid; grid-template-columns: repeat(2, 1fr);"
          />
        {/if}

        <!-- TODO: address double scroll bars when these are present -->
        <!-- TODO; maybe create an "after" slot in the mutableforeachcontainer to allow for this? -->
        {#if results.searchLimitExceeded}
          <small class="text-gray-500"
            >Search results were capped at {MAX_SEARCH_RESULTS_RETURN_COUNT} courses.</small
          >
        {/if}

        <!-- TODO: keep this here? -->
        <small class="text-gray-500"
          >If you could not find a particular course, check that you are searching the correct
          course catalog (if applicable).</small
        >
      {/if}
    {/await}
  </div>
</div>

<style lang="postcss">
  /* for the animated search spinner */
  .searchSpinner {
    display: inline-block;
    width: 74px;
    height: 74px;
    margin-top: 4rem;
  }
  .searchSpinner::after {
    content: '';
    display: block;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 6px solid #fff;
    border-color: #1b733c #1b733c #fff #fff; /* first is polyGreen */
    animation: searchSpinnerAnimation 2s linear infinite;
  }
  @keyframes searchSpinnerAnimation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>