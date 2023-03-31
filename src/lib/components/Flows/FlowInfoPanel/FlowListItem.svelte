<script lang="ts">
  import Fa from 'svelte-fa';
  import { tooltip } from '$lib/client/util/tooltipUtil';
  import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
  import type { FlowListItemData } from '$lib/types';

  export let item: FlowListItemData;
</script>

<div class="card">
  <div class="card-body text-center">
    <span class="text-base select-none w-[90%] break-words">
      {item.name}
    </span>
    <span class="absolute right-2 top-[15px]">
      <!-- TODO: investigate accessibility of tooltip (see associated tests as well) -->
      <div use:tooltip={item.tooltipParams} class="text-blue-500">
        <div class="text-lg">
          <Fa icon={faInfoCircle} />
        </div>
      </div>
    </span>
  </div>
</div>

<style lang="postcss">
  .card {
    transition: background 0.15s ease-in;

    /* only need overflow auto if the word breaking fails to take effect */
    @apply shadow border-base-300 mx-0 my-2 rounded-sm overflow-auto;

    /* make shadow a hair darker */
    --tw-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.16);
  }
  .card > .card-body {
    @apply p-3;
  }

  .card.selected {
    @apply bg-gray-300;
  }
  .card.selected:hover {
    @apply bg-gray-300;
    cursor: pointer;
  }
  .card:hover:not(.selected) {
    @apply bg-gray-200;
    cursor: pointer;
  }
  .card:active:not(.selected) {
    @apply bg-gray-300;
  }
</style>
