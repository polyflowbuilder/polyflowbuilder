<script lang="ts">
  import Fa from 'svelte-fa';
  import CourseItem from '../../FlowEditor/CourseItem.svelte';
  import MutableForEachContainer from '$lib/components/common/MutableForEachContainer.svelte';
  import CourseSearchOptionsSelector from './CourseSearchOptionsSelector.svelte';
  import { userFlowcharts } from '$lib/client/stores/userDataStore';
  import { selectedFlowIndex } from '$lib/client/stores/UIDataStore';
  import { COURSE_ITEM_SIZE_PX } from '$lib/client/config/uiConfig';
  import { buildTermCourseItemsData } from '$lib/client/util/courseItemUtil';
  import { courseCache, programCache } from '$lib/client/stores/apiDataStore';
  import { getCatalogFromProgramIDIndex } from '$lib/common/util/courseDataUtilCommon';
  import { initSearch, transformRawQuery } from '$lib/client/util/courseSearchUtil';
  import { MAX_SEARCH_RESULTS_RETURN_COUNT } from '$lib/common/config/catalogSearchConfig';
  import { activeSearchResults, searchCache } from '$lib/client/stores/catalogSearchStore';
  import { faExclamationCircle, faFileCircleXmark } from '@fortawesome/free-solid-svg-icons';
  import type { Flowchart } from '$lib/common/schema/flowchartSchema';
  import type { CourseItemData } from '$lib/types';
  import type { CatalogSearchValidFields } from '$lib/server/schema/searchCatalogSchema';

  // search options
  let searchProgramIndex = -1;
  let query = '';
  let field: CatalogSearchValidFields = 'id';

  // search results
  let items: CourseItemData[] = [];

  // for optional type
  $: selectedFlow = $userFlowcharts[$selectedFlowIndex] as Flowchart | undefined;

  // query transformation
  $: transformedQuery = transformRawQuery(query);

  // reset searches when we switch flows
  $: {
    $selectedFlowIndex;
    searchProgramIndex = $selectedFlowIndex !== -1 ? 0 : -1;
    field = 'id';
    query = '';
  }

  $: selectedCatalog = getCatalogFromProgramIDIndex(
    searchProgramIndex,
    selectedFlow?.programId ?? [''],
    $programCache
  );
  $: {
    if (selectedCatalog) {
      // reset results in UI so we don't see stale results during new query
      $activeSearchResults = undefined;
      initSearch(transformedQuery, selectedCatalog, field);
    }
  }

  // getting results from search
  $: void $activeSearchResults?.then((results) => {
    items = buildTermCourseItemsData(
      selectedFlow?.programId ?? [''],
      $courseCache,
      $programCache,
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
      },
      new Set()
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
<div class="h-full">
  <div class="max-h-full flex flex-col">
    <div>
      <h2 class="text-4xl font-medium text-polyGreen text-center mb-2">Add Courses</h2>
      <CourseSearchOptionsSelector bind:searchProgramIndex bind:field bind:query />
      <div class="divider my-2" />
    </div>

    {#await $activeSearchResults}
      <div class="text-center">
        <div class="loading loading-spinner w-16 text-polyGreen" />
      </div>
    {:then results}
      {#if results && searchProgramIndex !== -1 && $searchCache
          .find((entry) => entry.catalog === selectedCatalog)
          ?.searches.find((searchRecord) => searchRecord.query === `${field}|${transformedQuery}`)}
        {#if !results.searchValid}
          <div class="text-center">
            <div class="invalidSearchIcon pb-2">
              <Fa icon={faExclamationCircle} style="margin: auto;" />
            </div>
            <small class="text-gray-500"
              >Invalid search query. Please try a different search query.</small
            >
          </div>
        {:else if results.searchResults.length === 0}
          <div class="text-center">
            <div class="noResultsIcon pb-2">
              <Fa icon={faFileCircleXmark} style="margin: auto;" />
            </div>
            <small class="text-gray-500"
              >No results found. Please verify that the search parameters are correct.
            </small>
          </div>
        {:else}
          <!-- TODO: the text in the slot should always stay at the bottom of the results section -->
          <MutableForEachContainer
            {items}
            component={CourseItem}
            dndType="termContainer"
            dropFromOthersDisabled={true}
            on:itemsReorder={onSearchItemsReorder}
            itemStyle="width: {COURSE_ITEM_SIZE_PX}px; height: {COURSE_ITEM_SIZE_PX}px; margin: 0.5rem auto;"
            containerStyle="display: grid; grid-template-columns: repeat(2, 1fr); text-align: center;"
          >
            <div class="text-center">
              {#if results.searchLimitExceeded}
                <small class="text-gray-500"
                  >Search results were capped at {MAX_SEARCH_RESULTS_RETURN_COUNT} courses.</small
                >
              {/if}
              {#if results.searchValid}
                <small class="text-gray-500"
                  >If you could not find a particular course, verify and/or narrow your search
                  parameters.</small
                >
              {/if}
            </div>
          </MutableForEachContainer>
        {/if}
      {/if}
    {/await}
  </div>
</div>

<style lang="postcss">
  .invalidSearchIcon {
    @apply text-red-600;
    font-size: 4rem;
  }

  .noResultsIcon {
    @apply text-gray-400;
    font-size: 4rem;
  }
</style>
