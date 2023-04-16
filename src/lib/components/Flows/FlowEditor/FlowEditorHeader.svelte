<script lang="ts">
  import Fa from 'svelte-fa';
  import { createEventDispatcher } from 'svelte';
  import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
  import { FLOW_EDITOR_HEADER_PADDING_PX } from '$lib/client/config/uiConfig';

  export let name: string;
  export let enableLeftScrollArrow = false;
  export let enableRightScrollArrow = false;

  let titleWidth: number;

  const dispatch = createEventDispatcher();
</script>

<!-- TODO: make more responsive for mobile -->
<div class="pt-1">
  <div
    class="font-medium text-3xl text-polyGreen relative"
    style={`min-width: ${titleWidth + FLOW_EDITOR_HEADER_PADDING_PX}px;`}
  >
    <div class="absolute left-2 bottom-[0.125rem] font-bold">
      <button
        class="btn btn-sm btn-square btn-ghost"
        aria-label="flow editor left scroll"
        disabled={!enableLeftScrollArrow}
        on:click={() => dispatch('leftScrollArrowClick')}
      >
        <Fa icon={faArrowLeft} />
      </button>
      <button
        class="btn btn-sm btn-square btn-ghost"
        aria-label="flow editor right scroll"
        disabled={!enableRightScrollArrow}
        on:click={() => dispatch('rightScrollArrowClick')}
      >
        <Fa icon={faArrowRight} />
      </button>
    </div>
    <div class="w-fit m-auto" bind:clientWidth={titleWidth}>
      <h2>
        {name}
      </h2>
    </div>
  </div>
  <div class="divider my-0" />
</div>

<style lang="postcss">
  .btn:not(:hover) {
    background-color: hsla(var(--n) / 0.2);
  }
  .btn:hover {
    background-color: hsla(var(--n) / 0.4);
  }
</style>
