<script lang="ts">
  export let imageData: {
    src: string;
    title: string;
    desc: string;
  }[];
</script>

<div id="homeCarousel" class="carousel slide relative w-full" data-bs-ride="carousel">
  <div class="carousel-indicators absolute right-0 bottom-0 left-0 flex justify-center p-0">
    {#each imageData as _, i}
      <button
        type="button"
        data-bs-target="#homeCarousel"
        data-bs-slide-to={i}
        class:active={i === 0}
        aria-current={i === 0 ? 'true' : 'false'}
        aria-label="Slide {i + 1}"
      />
    {/each}
  </div>
  <div class="carousel-inner relative w-full overflow-hidden">
    {#each imageData as img, i}
      <div class="carousel-item relative float-left w-full" class:active={i === 0}>
        <!-- constant height here fixes CLS issues and makes sure things stay put -->
        <div class="flex items-center justify-center h-[640px]">
          <img src={img.src} class="block" alt={img.title} />
        </div>
        <div
          class="carousel-caption w-full left-0 right-0 bottom-0 bg-black/80 hidden md:block absolute text-center"
        >
          <h5 class="text-xl font-medium">{img.title}</h5>
          <p>{img.desc}</p>
        </div>
      </div>
    {/each}
  </div>
  <button
    class="carousel-control-prev absolute top-0 bottom-0 flex items-center justify-center p-0 text-center border-0 hover:outline-none hover:no-underline focus:outline-none focus:no-underline left-0"
    type="button"
    data-bs-target="#homeCarousel"
    data-bs-slide="prev"
  >
    <span class="carousel-control-prev-icon inline-block bg-no-repeat" aria-hidden="true" />
    <span class="visually-hidden">Previous</span>
  </button>
  <button
    class="carousel-control-next absolute top-0 bottom-0 flex items-center justify-center p-0 text-center border-0 hover:outline-none hover:no-underline focus:outline-none focus:no-underline right-0"
    type="button"
    data-bs-target="#homeCarousel"
    data-bs-slide="next"
  >
    <span class="carousel-control-next-icon inline-block bg-no-repeat" aria-hidden="true" />
    <span class="visually-hidden">Next</span>
  </button>
</div>

<style lang="postcss">
  /* stuff here isn't easily set in tailwind */
  img {
    max-height: 40rem;
  }
</style>
