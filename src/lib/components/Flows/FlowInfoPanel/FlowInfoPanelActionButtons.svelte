<script lang="ts">
  import { newFlowModalOpen } from '$lib/client/stores/modalStateStore';

  function openNewFlowModal() {
    $newFlowModalOpen = true;
  }
</script>

<div>
  <div class="flex justify-center">
    <button class="flex-1 mx-1 btn btn-almostmd btn-accent" on:click={openNewFlowModal}
      >New Flow</button
    >
    <button class="flex-1 mx-1 btn btn-almostmd bg-gray-400 border-none hover:bg-gray-500"
      >Actions</button
    >
    <button class="flex-1 mx-1 btn btn-almostmd bg-red-500 border-none hover:bg-red-600"
      >Delete Flow</button
    >
  </div>
</div>
