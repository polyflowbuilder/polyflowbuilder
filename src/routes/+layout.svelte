<script lang="ts">
  import '../app.postcss';
  import { Footer, Header } from '$lib/components/common';
  import { catalogYearsData, programData, startYearsData } from '$lib/client/stores/apiDataStore';
  import type { LayoutData } from './$types';

  export let data: LayoutData;

  // init metadata in app
  $: if (data.programData) {
    startYearsData.init(data.programData.startYears);
    catalogYearsData.init(data.programData.catalogs);
    programData.init(data.programData.programData);
  }
</script>

<svelte:head>
  <!-- will be shared with all pages -->
  <!-- has all information contained in head tag of pages -->
  <meta
    name="description"
    content="PolyFlowBuilder allows you to easily plan and visualize your academic path while at Cal Poly SLO."
  />
  <meta name="author" content="Duncan Applegarth" />
  <meta
    name="keywords"
    content="polyflowbuilder polyflow flow builder plan visualize cal poly slo san luis obispo schedule"
  />
  <title>PolyFlowBuilder</title>

  <!-- TODO: add Google Analytics -->
</svelte:head>

<div class="min-h-screen flex flex-col">
  <Header />
  <div class="flex-1">
    <slot />
  </div>
  <Footer />
</div>
