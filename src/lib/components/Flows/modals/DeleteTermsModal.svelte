<script lang="ts">
  import { modal } from '$lib/client/util/modalUtil';
  import { userFlowcharts } from '$lib/client/stores/userDataStore';
  import { selectedFlowIndex } from '$lib/client/stores/UIDataStore';
  import { generateTermString } from '$lib/common/util/flowTermUtilCommon';
  import { deleteTermsModalOpen } from '$lib/client/stores/modalStateStore';
  import { UserDataUpdateChunkType } from '$lib/types';
  import { submitUserDataUpdateChunk } from '$lib/client/util/mutateUserDataUtilClient';

  let selectedTermValues: number[] = [];

  $: flowchartStartYear = $userFlowcharts[$selectedFlowIndex]?.startYear;
  $: termStringsData =
    $userFlowcharts[$selectedFlowIndex]?.termData.slice(1).map((t) => {
      return {
        termIdx: t.tIndex,
        termString: generateTermString(t.tIndex, flowchartStartYear)
      };
    }) ?? [];

  function deleteTerms() {
    submitUserDataUpdateChunk({
      type: UserDataUpdateChunkType.FLOW_TERMS_DELETE,
      data: {
        id: $userFlowcharts[$selectedFlowIndex].id,
        tIndexes: selectedTermValues
      }
    });
    closeModal();
  }

  function closeModal() {
    $deleteTermsModalOpen = false;
    selectedTermValues = [];
  }
</script>

<dialog use:modal={deleteTermsModalOpen} class="modal">
  <div class="modal-box">
    <h2 class="text-3xl font-medium text-polyGreen text-center">Remove Flowchart Terms</h2>

    <div class="divider" />

    <label class="label" for="addTerms">
      <span class="label-text text-base"
        >Select the terms you wish to remove to your flowchart (multiple terms can be selected):</span
      >
    </label>
    <select
      class="w-full select select-bordered"
      multiple
      name="addTerms"
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
        on:click={deleteTerms}>Remove Terms from Flowchart</button
      >
      <div class="divider divider-horizontal" />
      <button class="btn btn-almostmd flex-1" on:click={closeModal}>Cancel</button>
    </div>
  </div>
</dialog>
