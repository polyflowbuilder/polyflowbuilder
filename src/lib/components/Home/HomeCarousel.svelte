<script lang="ts">
  import { onMount } from 'svelte';

  // TODO: look into alternatives due to large bundle here
  onMount(async () => {
    const { Carousel, initTE } = await import('tw-elements');
    initTE({ Carousel });
  });

  export let imageData: {
    src: string;
    title: string;
    desc: string;
  }[];
</script>

<div
  id="homeCarousel"
  class="relative"
  data-te-carousel-init
  data-te-carousel-slide
>
  <!--Carousel indicators-->
  <div
    class="absolute bottom-0 left-0 right-0 z-[2] mx-[15%] flex list-none justify-center p-0"
    data-te-carousel-indicators
  >
    {#each imageData as _, i}
      <button
        type="button"
        class="mx-[3px] box-content h-[3px] w-[30px] flex-initial cursor-pointer border-0 border-y-[10px] border-solid border-transparent bg-white bg-clip-padding p-0 -indent-[999px] opacity-50 transition-opacity duration-[600ms] ease-[cubic-bezier(0.25,0.1,0.25,1.0)] motion-reduce:transition-none"
        data-te-target="#homeCarousel"
        data-te-slide-to={i}
        data-te-carousel-active={i === 0 ? '' : null}
        aria-current={i === 0}
        aria-label="Slide {i + 1}"
      />
    {/each}
  </div>

  <!--Carousel items-->
  <div
    class="relative w-full overflow-hidden after:clear-both after:block after:content-['']"
  >
    {#each imageData as img, i}
      <div
        class="relative float-left -mr-[100%] w-full transition-transform duration-[600ms] ease-in-out motion-reduce:transition-none"
        class:hidden={i !== 0}
        data-te-carousel-active={i === 0 ? '' : null}
        data-te-carousel-item
        style="backface-visibility: hidden"
      >
        <!-- constant height here fixes CLS issues and makes sure things stay put -->
        <div class="flex items-center justify-center h-[640px]">
          <img src={img.src} class="block" alt={img.title} />
        </div>
        <div
          class="absolute w-full bottom-0 hidden py-5 text-center bg-black/80 text-white xs:block"
        >
          <h5 class="text-xl">{img.title}</h5>
          <p>{img.desc}</p>
        </div>
      </div>
    {/each}
  </div>

  <!--Carousel controls - prev item-->
  <button
    class="absolute bottom-0 left-0 top-0 z-[1] flex w-[5%] items-center justify-center border-0 bg-none p-0 text-center text-black opacity-50 transition-opacity duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] hover:text-black hover:no-underline hover:opacity-90 hover:outline-none focus:text-black focus:no-underline focus:opacity-90 focus:outline-none motion-reduce:transition-none"
    type="button"
    data-te-target="#homeCarousel"
    data-te-slide="prev"
  >
    <span class="inline-block h-8 w-8">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="h-6 w-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.75 19.5L8.25 12l7.5-7.5"
        />
      </svg>
    </span>
    <span
      class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
    >
      Previous
    </span>
  </button>
  <!--Carousel controls - next item-->
  <button
    class="absolute bottom-0 right-0 top-0 z-[1] flex w-[5%] items-center justify-center border-0 bg-none p-0 text-center text-black opacity-50 transition-opacity duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] hover:text-black hover:no-underline hover:opacity-90 hover:outline-none focus:text-black focus:no-underline focus:opacity-90 focus:outline-none motion-reduce:transition-none"
    type="button"
    data-te-target="#homeCarousel"
    data-te-slide="next"
  >
    <span class="inline-block h-8 w-8">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="h-6 w-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    </span>
    <span
      class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
    >
      Next
    </span>
  </button>
</div>

<style lang="postcss">
  /* stuff here isn't easily set in tailwind */
  img {
    max-height: 40rem;
  }
</style>
