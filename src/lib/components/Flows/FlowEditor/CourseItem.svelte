<script lang="ts">
  import 'tippy.js/dist/tippy.css';
  import 'tippy.js/themes/light.css';
  import { tooltip } from '$lib/client/util/tooltipUtil';
  import type { CourseItemData } from '$lib/types';

  export let item: CourseItemData;

  $: color = item.color || 'white';

  let selected = false;
</script>

<!-- TODO: investigate accessibility of tooltip -->
<!-- TODO: address accessibility -->
<!-- 
  exact width and height controlled by MutableForEachContainer to make sure
  selection containers are correct
-->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="courseItem select-none card shadow inline-block rounded-none p-1 w-full h-full"
  class:selected
  style="background-color: {color}"
  on:click={() => (selected = !selected)}
  use:tooltip={item.tooltipParams}
>
  <h6 class="font-semibold multilineText mb-1">
    {item.idName}
  </h6>
  <p class="multilineText m-0 text-xs">
    {item.displayName}
  </p>
  <span>
    <h5 class="text-xs absolute bottom-1 left-1/2 -translate-x-1/2">
      {item.units && item.units !== '0'
        ? item.units === '1'
          ? '1 unit'
          : `${item.units} units`
        : ''}
    </h5>
  </span>
</div>

<style lang="postcss">
  .courseItem {
    border: 1px solid rgba(128, 128, 128, 0.375);
  }

  .courseItem:hover {
    outline: 4px solid rgba(255, 0, 0, 0.25);
    outline-offset: 2px;
  }

  .courseItem.selected {
    outline: 4px solid rgb(255, 0, 0, 1);
    outline-offset: 2px;
  }

  .multilineText {
    @apply break-words overflow-ellipsis line-clamp-2;
  }
</style>
