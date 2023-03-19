<script lang="ts">
  // TODO: put these styles in a better place?
  import 'tippy.js/dist/tippy.css';
  import 'tippy.js/themes/light-border.css';
  import { FlowInfoPanel } from '$lib/components/Flows/FlowInfoPanel';
  import { FlowViewer } from '$lib/components/Flows';
  import { userFlowcharts } from '$lib/client/stores/userDataStore';
  import { ModalWrapper } from '$lib/components/Flows/modals';
  import type { PageData } from './$types';

  export let data: PageData;

  $: if (data.flowcharts) {
    userFlowcharts.set(data.flowcharts);
  }
</script>

<div class="flowContainer w-full flex">
  <FlowInfoPanel />
  <FlowViewer />
</div>

<ModalWrapper />

<style lang="postcss">
  /* have the header and flow viewer content take up 100vh, not just the flow viewer */
  /* 90px is height of header & some extra added pixels so we see the bottom shadow of the flow container card */
  .flowContainer {
    min-height: calc(100vh - 90px);
    height: calc(100vh - 90px);
  }
</style>
