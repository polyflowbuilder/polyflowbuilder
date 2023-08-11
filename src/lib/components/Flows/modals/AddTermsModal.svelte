<script lang="ts">
  import { modal } from '$lib/client/util/modalUtil';
  import { userFlowcharts } from '$lib/client/stores/userDataStore';
  import { selectedFlowIndex } from '$lib/client/stores/UIDataStore';
  import { addTermsModalOpen } from '$lib/client/stores/modalStateStore';
  import { UserDataUpdateChunkType } from '$lib/types';
  import { submitUserDataUpdateChunk } from '$lib/client/util/mutateUserDataUtilClient';
  import { generateMissingTermStrings } from '$lib/client/util/flowTermUtilClient';

  let selectedTermValues: number[] = [];

  $: termStringsData = generateMissingTermStrings($userFlowcharts[$selectedFlowIndex]);

  function addNewTerms() {
    submitUserDataUpdateChunk({
      type: UserDataUpdateChunkType.FLOW_TERMS_ADD,
      data: {
        id: $userFlowcharts[$selectedFlowIndex].id,
        tIndexes: selectedTermValues
      }
    });
    closeModal();
  }

  function closeModal() {
    $addTermsModalOpen = false;
    selectedTermValues = [];
  }
</script>

<dialog use:modal={addTermsModalOpen} class="modal">
  <div class="modal-box">
    <h2 class="text-3xl font-medium text-polyGreen text-center">Add Flowchart Terms</h2>

    <div class="divider" />

    <label class="label" for="addTerms">
      <span class="label-text text-base"
        >Select the terms you wish to add to your flowchart (multiple terms can be selected):</span
      >
    </label>
    <select
      class="w-full select select-bordered"
      multiple
      name="addTerms"
      aria-label="select flowchart terms to add"
      size="15"
      bind:value={selectedTermValues}
    >
      {#each termStringsData as termStringData}
        <option value={termStringData.termIdx}>{termStringData.termString}</option>
      {/each}
    </select>

    <div class="flex mt-4">
      <button
        class="btn btn-almostmd btn-accent flex-1"
        disabled={selectedTermValues.length === 0}
        on:click={addNewTerms}>Add Terms to Flowchart</button
      >
      <div class="divider divider-horizontal" />
      <button class="btn btn-almostmd flex-1" on:click={closeModal}>Cancel</button>
    </div>
  </div>
</dialog>
