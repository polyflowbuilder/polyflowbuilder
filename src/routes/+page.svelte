<script>
  import { HomeCarousel } from '$lib/components/Home';
  import { homeCarouselImageData } from '$lib/config/homeCarouselConfig';
  import { PUBLIC_PFB_DISCORD_LINK } from '$env/static/public';
</script>

<svelte:head>
  <script src="https://cdn.jsdelivr.net/npm/tw-elements/dist/js/index.min.js"></script>
</svelte:head>

<main class="container mx-auto text-center">
  <h1 class="text-polyGreen mt-8 mb-4 text-4xl font-medium">Welcome to PolyFlowBuilder!</h1>
  <p>
    This tool allows you to easily visualize and plan your academic path during your stay at Cal
    Poly SLO!
  </p>

  <div class="divider" />
  <HomeCarousel imageData={homeCarouselImageData} />
  <div class="divider" />

  <p>
    Please note that this project is still in active development. If you would like to report
    something broken or provide suggestions to improve PolyFlowBuilder, please contact us through
    the <a href="/feedback" class="clickLink">Feedback</a>
    page or the
    <a href={PUBLIC_PFB_DISCORD_LINK} class="clickLink">PolyFlowBuilder Discord server</a>. Thank
    you!
  </p>
</main>

<style lang="postcss">
  .clickLink {
    @apply text-blueLink hover:underline hover:underline-offset-2;
  }
</style>
