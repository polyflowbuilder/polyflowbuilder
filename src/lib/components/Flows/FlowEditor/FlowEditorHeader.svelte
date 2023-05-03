<script lang="ts">
  import Fa from 'svelte-fa';
  import { createEventDispatcher } from 'svelte';
  import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
  import {
    FLOW_EDITOR_HEADER_PADDING_PX,
    TERM_CONTAINER_WIDTH_PX
  } from '$lib/client/config/uiConfig';

  export let name: string;
  export let enableLeftScrollArrow = false;
  export let enableRightScrollArrow = false;

  let titleWidth: number;
  let headerWidth: number;

  $: titleMinWidth = titleWidth + FLOW_EDITOR_HEADER_PADDING_PX;
  $: hideTitle = headerWidth <= TERM_CONTAINER_WIDTH_PX;

  const dispatch = createEventDispatcher();
</script>

<div
  class="pt-1 overflow-clip"
  class:mr-2={headerWidth <= titleMinWidth}
  bind:clientWidth={headerWidth}
>
  <div
    class="font-medium text-3xl text-polyGreen relative"
    style={`min-width: ${titleMinWidth}px;`}
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
    <!--
      use a "pseudo hidden" class here bc if we apply no display,
      absolutely positioned buttons get messed up
    -->
    <div class="w-fit m-auto" class:pseudoHidden={hideTitle} bind:clientWidth={titleWidth}>
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

  .pseudoHidden {
    @apply text-white select-none;
  }
</style>
