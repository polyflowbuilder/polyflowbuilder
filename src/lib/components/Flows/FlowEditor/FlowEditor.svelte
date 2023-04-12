<script lang="ts">
  import type { Flowchart } from '$lib/common/schema/flowchartSchema';

  export let flowchart: Flowchart;

  $: console.log('flowchart in editor', flowchart);
</script>

<div class="h-full">
  <div class="flowEditorHeader">{flowchart.name}</div>
  <div class="flowEditorTermsContainer">termcount: {flowchart.termData.length}</div>
  <div class="flowEditorFooter">units: {flowchart.unitTotal}</div>
</div>

<style lang="postcss">
  .flowEditorHeader {
    height: 3rem;
    border: 1px solid black;
  }
  .flowEditorTermsContainer {
    height: calc(100% - 3rem - 3rem);
    border: 1px solid black;
  }
  .flowEditorFooter {
    height: 3rem;
    border: 1px solid black;
  }
</style>
