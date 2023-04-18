<script lang="ts">
  import { TERM_CONTAINER_WIDTH_PX } from '$lib/client/config/uiConfig';

  // TODO: create tests for this component

  export let termName: string;
</script>

<div
  class="termContainer h-full text-center bg-slate-50 border-l-2 overflow-y-hidden"
  style="width: {TERM_CONTAINER_WIDTH_PX}px;"
>
  <div class="termContainerHeader">
    <h3 class="mt-1">{termName}</h3>
    <div class="divider m-0 px-2 h-1" />
  </div>
  <div class="termContainerBody" />
  <div class="termContainerFooter">
    <div class="divider m-0 pb-[2px] h-0 px-2" />
    <h3>16 (4)</h3>
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
</style>
