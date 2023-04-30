<script lang="ts">
  import CourseItem from './CourseItem.svelte';
  import MutableForEachContainer from '$lib/components/common/MutableForEachContainer.svelte';
  import { courseCache, programData } from '$lib/client/stores/apiDataStore';
  import { buildTermCourseItemsData } from '$lib/client/util/courseItemUtil';
  import { COURSE_ITEM_SIZE_PX, TERM_CONTAINER_WIDTH_PX } from '$lib/client/config/uiConfig';
  import type { Term } from '$lib/common/schema/flowchartSchema';
  import type { CourseItemData } from '$lib/types';

  export let flowProgramId: string[];
  export let term: Term;
  export let termName: string;

  $: items = buildTermCourseItemsData(flowProgramId, $courseCache, $programData, term.courses);

  function onCourseItemReorder(event: CustomEvent<CourseItemData[]>) {
    // TODO: do a bunch of stuff here
    items = event.detail;
  }
</script>

<!--
  min-width is for keeping container from shrinking when no courses in it,
  max-width is for preventing container from growing if term string too long
-->
<div
  class="termContainer h-full text-center bg-slate-50 border-l-2 overflow-y-hidden"
  style="min-width: {TERM_CONTAINER_WIDTH_PX}px; max-width: {TERM_CONTAINER_WIDTH_PX}px;"
>
  <div class="termContainerHeader">
    <h3 class="mt-1">{termName}</h3>
    <div class="divider m-0 px-2 h-1" />
  </div>
  <div class="termContainerBody">
    <MutableForEachContainer
      {items}
      component={CourseItem}
      dndType="termContainer"
      itemStyle="width: {COURSE_ITEM_SIZE_PX}px; height: {COURSE_ITEM_SIZE_PX}px; margin: 0.5rem auto;"
      on:itemsReorder={onCourseItemReorder}
    />
  </div>
  <div class="termContainerFooter">
    <div class="divider m-0 px-2 h-1" />
    <h3>
      {term.tUnits}
      {term.courses.length ? `(${term.courses.length})` : ''}
    </h3>
  </div>
</div>

<style lang="postcss">
  .termContainerHeader {
    height: 2rem;
  }

  .termContainerBody {
    height: calc(100% - 2rem - 2rem);
  }

  .termContainerFooter {
    height: 2rem;
  }

  /*
    margin autos are for centering term containers until they fill the flow editor
    viewport, then have it go left-to-right
  */
  .termContainer:first-child {
    @apply ml-auto;
  }
  .termContainer:last-child {
    @apply mr-auto border-r-2;
  }
</style>
