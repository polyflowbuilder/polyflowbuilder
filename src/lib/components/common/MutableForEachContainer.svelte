<!--
  generic for each container whose IDs can be mutated
  also includes drag and drop support for items
-->
<script lang="ts">
  import { flip } from 'svelte/animate';
  import { dndzone } from 'svelte-dnd-action';
  import { v4 as uuid } from 'uuid';
  import { createEventDispatcher } from 'svelte';
  import type { DndEvent } from 'svelte-dnd-action';
  import type { SvelteComponent } from 'svelte';
  import type { MutableForEachContainerItemInternal } from '$lib/types';

  const dispatch = createEventDispatcher();

  // data props
  export let items: unknown[];
  export let component: typeof SvelteComponent<{ item: unknown }>;

  // customization props
  export let containerClass = '';
  export let containerStyle = '';
  export let itemClass = '';
  export let itemStyle = '';

  // drag and drop props
  export let dndType = '';
  export let dropFromOthersDisabled = false;
  export let flipDurationMs = 300;

  // create 'internal items' so that we can freely mutate the IDs in the itemsData objects
  let internalItemsData: MutableForEachContainerItemInternal[] = [];
  $: internalItemsData = createInternalItemsWrapper(items);

  // wrapper to hide from reactivity
  function createInternalItemsWrapper(
    inputItemsData: unknown[]
  ): MutableForEachContainerItemInternal[] {
    const outputInternalItemsData: MutableForEachContainerItemInternal[] = [];

    for (let idx = 0; idx < inputItemsData.length; idx += 1) {
      outputInternalItemsData.push({
        id: internalItemsData[idx]?.id || uuid(),
        item: inputItemsData[idx]
      });
    }

    return outputInternalItemsData;
  }

  // handle dragging updates
  function handleConsider(e: CustomEvent<DndEvent<MutableForEachContainerItemInternal>>) {
    internalItemsData = e.detail.items;
  }
  function handleFinalize(e: CustomEvent<DndEvent<MutableForEachContainerItemInternal>>) {
    internalItemsData = e.detail.items;

    // only emit the data items, not the internal ones
    const emitItemsData = e.detail.items.map((internalItem) => internalItem.item);
    dispatch('itemsReorder', emitItemsData);
  }
</script>

{#if dndType !== ''}
  <div class="mutableForEachContainer">
    <section
      use:dndzone={{
        items: internalItemsData,
        dropTargetStyle: {},
        type: dndType,
        dropFromOthersDisabled
      }}
      on:consider={handleConsider}
      on:finalize={handleFinalize}
      class={containerClass}
      style={containerStyle}
    >
      {#each internalItemsData as internalItem (internalItem.id)}
        <div animate:flip={{ duration: flipDurationMs }} class={itemClass} style={itemStyle}>
          <svelte:component this={component} item={internalItem.item} on:itemEvent />
        </div>
      {/each}
    </section>
    <slot />
  </div>
{:else}
  <div class="mutableForEachContainer">
    <section class={containerClass} style={containerStyle}>
      {#each internalItemsData as internalItem (internalItem.id)}
        <div class={itemClass} style={itemStyle}>
          <svelte:component this={component} item={internalItem.item} on:itemEvent />
        </div>
      {/each}
    </section>
    <slot />
  </div>
{/if}

<style lang="postcss">
  /* need both containers to have full height 
    so courses can be dragged into an empty term
    (or else dndzone section is 0px tall with empty term)
  */
  div.mutableForEachContainer,
  div.mutableForEachContainer section {
    /* allow scrolling */
    overflow: auto;
    height: 100%;
  }
</style>
