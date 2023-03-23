<!-- flowchart info panel -->
<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { AddCoursesTab, ManageFlowsTab } from '$lib/components/Flows/FlowInfoPanel';
  import { PANEL_SIZE_CLOSED, PANEL_SIZE_OPEN } from '$lib/client/config/uiConfig';

  // collapsible side panel logic
  let visible = true;
  let size = tweened(PANEL_SIZE_OPEN, {
    duration: 400,
    easing: cubicOut
  });
  $: if (visible) {
    size.set(PANEL_SIZE_OPEN);
  } else {
    size.set(PANEL_SIZE_CLOSED);
  }

  let activeTab: 'manageFlows' | 'addCourses' = 'manageFlows';
</script>

<!-- TODO: figure out UI/UX for collapsible side panel -->
<!-- TODO: auto-collapse when screen size too small -->
<!-- TODO: allow overlay or permanent set -->
<input type="checkbox" class="absolute right-0 top-0 z-20" bind:checked={visible} />
<div class="flowInfoPanel card {!$size ? 'opacity-0' : ''}" style="--boxSize: {$size}px;">
  {#if visible && $size > PANEL_SIZE_OPEN * 0.9}
    <div class="tabs justify-center mt-2">
      <a
        href={'#'}
        class="tab tab-bordered"
        class:tab-active={activeTab === 'manageFlows'}
        on:click|preventDefault={() => (activeTab = 'manageFlows')}>Manage Flows</a
      >
      <a
        href={'#'}
        class="tab tab-bordered"
        class:tab-active={activeTab === 'addCourses'}
        on:click|preventDefault={() => (activeTab = 'addCourses')}>Add Courses</a
      >
    </div>

    <div class="card-body p-4 h-[95%]">
      {#if activeTab === 'manageFlows'}
        <ManageFlowsTab />
      {:else if activeTab === 'addCourses'}
        <AddCoursesTab />
      {/if}
    </div>
  {/if}
</div>

<style lang="postcss">
  .flowInfoPanel.card {
    @apply shadow border-base-300 ml-2 mt-0 rounded-sm;

    /* make shadow a hair darker */
    --tw-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.16);
  }

  .flowInfoPanel {
    min-width: var(--boxSize);
    width: var(--boxSize);
  }
</style>
