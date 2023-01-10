<script lang="ts">
  import { PUBLIC_PFB_DISCORD_LINK } from '$env/static/public';
</script>

<main class="container mx-auto">
  <h1 class="text-polyGreen mt-8 mb-4 text-4xl font-medium text-center">About PolyFlowBuilder</h1>
  <div class="divider" />
  <div class="text-justify">
    <p>
      PolyFlowBuilder was made by me (Duncan Applegarth) during the Summer of 2020, and I am
      currently maintaining it. I am currently a fourth-year Cal Poly SLO student pursuing a major
      in Computer Engineering and minors in Data Science and Mathematics. This has been a fun
      project to develop and iterate on - it allows me to apply all the skills that I have learned
      in and out of my classes (and it also gives me something to do during breaks, which is nice).
    </p>
    <p>
      My main inspiration for this project came from the fact that there (currently) is no viable
      alternative to the popular student-made flowchart maker <a
        href="http://polyflows.com"
        target="_blank"
        rel="noopener noreferrer"
        class="hyperlink">PolyFlows</a
      > (which I used myself until I developed PolyFlowBuilder). My goal is to improve on the original
      ideas PolyFlows has and add my own twist to it, while providing a (hopefully) useful tool for other
      Cal Poly SLO students to use to help plan the academic side of their stay here! (I'm not too sure
      what's going on with Degree Planner, anyways...)
    </p>
    <p>
      This is my first full-stack web project, so if there are any bugs/issues/concerns you have
      about it (or you would like to help contribute!), please let me know on the <a
        href="/feedback"
        class="hyperlink">Feedback</a
      >
      page or the
      <a href={PUBLIC_PFB_DISCORD_LINK} class="hyperlink">PolyFlowBuilder Discord server</a>!
    </p>
  </div>
  <div class="text-center">
    <img src="/assets/about-me-min.png" class="m-auto rounded-lg" alt="" />
  </div>
</main>

<style lang="postcss">
  p {
    @apply my-6 mx-4;
  }
</style>
