<script lang="ts">
  import '../app.postcss';
  import { onMount } from 'svelte';
  import { version } from '$app/environment';
  import { Footer, Header } from '$lib/components/common';
  import { PUBLIC_PFB_ANALYTICS_ID } from '$env/static/public';

  onMount(() => {
    console.log(
      `PolyFlowBuilder (c) ${new Date().getFullYear().toString()} duncanapple.io (${version})`
    );
  });
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

  <script
    async
    src="https://analytics.polyflowbuilder.io/script.js"
    data-website-id={PUBLIC_PFB_ANALYTICS_ID}
  ></script>
</svelte:head>

<div class="min-h-screen flex flex-col scrollbar-thin">
  <Header />
  <div class="flex-1">
    <slot />
  </div>
  <Footer />
</div>
