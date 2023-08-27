<script lang="ts">
  import CourseItem from './CourseItem.svelte';
  import MutableForEachContainer from '$lib/components/common/MutableForEachContainer.svelte';
  import { selectedCourses } from '$lib/client/stores/UIDataStore';
  import { courseCache, programCache } from '$lib/client/stores/apiDataStore';
  import { submitUserDataUpdateChunk } from '$lib/client/util/mutateUserDataUtilClient';
  import { UPDATE_CHUNK_DELAY_TIME_MS } from '$lib/client/config/editorConfig';
  import { COURSE_ITEM_SIZE_PX, TERM_CONTAINER_WIDTH_PX } from '$lib/client/config/uiConfig';
  import {
    buildTermCourseItemsData,
    buildTermModUpdateChunkFromCourseItems
  } from '$lib/client/util/courseItemUtil';
  import type { Term } from '$lib/common/schema/flowchartSchema';
  import type { CourseItemData, SelectedCourse } from '$lib/types';

  export let flowId: string;
  export let flowProgramId: string[];

  export let term: Term;
  export let termName: string;

  $: items = buildTermCourseItemsData(
    flowProgramId,
    $courseCache,
    $programCache,
    term,
    $selectedCourses
  );

  function onCourseItemReorder(event: CustomEvent<CourseItemData[]>) {
    // build indexes for comparison
    const oldIdxs = items.map((courseData) => [
      courseData.metadata.tIndex,
      courseData.metadata.cIndex
    ]);
    const newIdxs = event.detail.map((courseData) => [
      courseData.metadata.tIndex,
      courseData.metadata.cIndex
    ]);

    // if we have differences, build term diff and submit update chunk
    if (oldIdxs.toString() !== newIdxs.toString()) {
      // build term diff and submit update chunk
      const termModUpdateChunk = buildTermModUpdateChunkFromCourseItems(
        flowId,
        flowProgramId,
        $courseCache,
        $programCache,
        event.detail,
        term.tIndex
      );
      submitUserDataUpdateChunk(termModUpdateChunk);

      // update selected courses
      items.forEach((item) => {
        $selectedCourses.delete(`${item.metadata.tIndex},${item.metadata.cIndex}`);
      });
      event.detail.forEach((crs, i) => {
        if (crs.metadata.selected) {
          $selectedCourses.add(`${term.tIndex},${i}`);
        }
      });
      // update the selected courses after the TERM_MOD update has been applied
      // TODO: should probably add a callback/hook for when the update is done,
      // but this works just fine for now
      setTimeout(() => {
        $selectedCourses = $selectedCourses;
      }, UPDATE_CHUNK_DELAY_TIME_MS + 1);
    }

    items = event.detail;
  }

  function onCourseSelectedChange(event: CustomEvent<SelectedCourse>) {
    if (event.detail.selected) {
      $selectedCourses.add(`${event.detail.tIndex},${event.detail.cIndex}`);
    } else {
      $selectedCourses.delete(`${event.detail.tIndex},${event.detail.cIndex}`);
    }
    // need to assign to trigger reactivity
    $selectedCourses = $selectedCourses;
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
      on:itemEvent={onCourseSelectedChange}
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
