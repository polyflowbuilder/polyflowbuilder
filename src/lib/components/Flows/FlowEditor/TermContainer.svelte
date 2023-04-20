<script lang="ts">
  import { TERM_CONTAINER_WIDTH_PX } from '$lib/client/config/uiConfig';
  import type { Term } from '$lib/common/schema/flowchartSchema';

  export let term: Term;
  export let termName: string;
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
  <div class="termContainerBody" />
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
