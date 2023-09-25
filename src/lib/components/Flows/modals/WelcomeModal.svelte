<script lang="ts">
  import { PUBLIC_PFB_DISCORD_LINK, PUBLIC_PFB_GITHUB_LINK } from '$env/static/public';
  import { welcomeModalOpen } from '$lib/client/stores/modalStateStore';
  import { modal } from '$lib/client/util/modalUtil';

  function closeModal() {
    $welcomeModalOpen = false;
  }
</script>

<dialog use:modal={welcomeModalOpen} class="modal">
  <div class="modal-box">
    <h2 class="text-3xl font-medium text-polyGreen text-center">Welcome to PolyFlowBuilder!</h2>

    <div class="divider" />

    <div>
      <p class="mb-4">
        It appears that this is your first time using PolyFlowBuilder on this device. Welcome to the
        PolyFlowBuilder community!
      </p>
      <p class="mb-4">
        PolyFlowBuilder has been rewritten from the ground up to allow the project to grow, scale,
        and be more organized for years to come. The previous version of PolyFlowBuilder was
        something I threw together as a summer project and it's frankly a miracle it's been stable
        for as long as it has.
      </p>
      <p class="mb-4">
        Also note that PolyFlowBuilder has been made open source to ensure the project's longevitiy!
        Click on the GitHub icon in the top-right of the screen to view the source code for the
        project.
      </p>
      <p class="mb-4">
        New features will continue to be developed for PolyFlowBuilder going forward. If you have
        any questions, bug reports, feature requests, or any other feedback/comments about the
        project, feel free to reach out and/or get involved via the following channels:
      </p>
      <ul class="list-decimal list-inside mb-4">
        <li>
          Project Contributions: <a href={PUBLIC_PFB_GITHUB_LINK} class="hyperlink" target="_blank"
            >GitHub</a
          >
        </li>
        <li>
          PolyFlowBuilder Discord Server: <a
            href={PUBLIC_PFB_DISCORD_LINK}
            class="hyperlink"
            target="_blank">Discord Server</a
          >
        </li>
        <li>
          PolyFlowBuilder Official Feedback Form: <a
            href="/feedback"
            class="hyperlink"
            target="_blank">Feedback Form</a
          >
        </li>
      </ul>
      <p class="mb-4">
        Thank you so much to everyone who has contributed to PolyFlowBuilder's development and
        growth thus far, and thank YOU for using PolyFlowBuilder! I hope this tool is able to help
        you on your academic journey at Cal Poly, SLO. 😄
      </p>
      <p class="mb-4">- Duncan A, PolyFlowBuilder Core Maintainer</p>

      <p class="mb-4 text-center text-xs text-gray-500">
        (view this message again by clicking on the user icon in the top-right icon and selecting
        "View Welcome Message")
      </p>
    </div>

    <button class="btn btn-almostmd w-full" on:click={closeModal}> Close </button>
  </div>
</dialog>

<style lang="postcss">
  /* expand modal size */
  .modal-box {
    max-width: 48rem;
  }
</style>
