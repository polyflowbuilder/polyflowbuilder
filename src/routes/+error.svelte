<script lang="ts">
  import Fa from 'svelte-fa';
  import { faExclamationTriangle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
  import { page } from '$app/stores';

  $: console.log($page.error?.message);
</script>

<main class="container mx-auto text-center p-40 h-full">
  <div>
    {#if $page.error?.message === 'Not Found'}
      <div class="notFoundExclamation pb-4">
        <Fa icon={faExclamationTriangle} style="margin: auto;" />
      </div>
      <h1 class="font-semibold text-4xl">
        The page you requested could not be found. Sorry about that!
      </h1>
      <p>The URL may be misspelled, or the page you're looking for is no longer available.</p>
    {:else}
      <div class="internalErrorExclamation pb-4">
        <Fa icon={faExclamationCircle} style="margin: auto;" />
      </div>
      <h1 class="font-semibold text-4xl">
        An internal server error has occurred. Please reload the page.
      </h1>
      <p>
        If this persists, please submit a bug report on the <a href="/feedback" class="hyperlink"
          >Feedback</a
        > page.
      </p>
    {/if}
  </div>
</main>

<style lang="postcss">
  .notFoundExclamation {
    color: #fcb103;
    font-size: 12rem;
  }
  .internalErrorExclamation {
    color: #ef4444;
    font-size: 12rem;
  }
</style>
