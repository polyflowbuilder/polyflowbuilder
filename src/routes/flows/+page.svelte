<script lang="ts">
  import { FlowInfoPanel } from '$lib/components/Flows';
  import { FlowViewer } from '$lib/components/Flows';
</script>

<div class="flowContainer w-full flex">
  <FlowInfoPanel />
  <FlowViewer />
</div>

<style lang="postcss">
  /* have the header and flow viewer content take up 100vh, not just the flow viewer */
  /* 90px is height of header & some extra added pixels so we see the bottom shadow of the flow container card */
  .flowContainer {
    min-height: calc(100vh - 90px);
    height: calc(100vh - 90px);
  }
</style>
