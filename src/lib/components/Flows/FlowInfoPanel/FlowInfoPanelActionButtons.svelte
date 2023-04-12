<script lang="ts">
  import { userFlowcharts } from '$lib/client/stores/userDataStore';
  import { newFlowModalOpen } from '$lib/client/stores/modalStateStore';
  import { selectedFlowIndex } from '$lib/client/stores/UIDataStore';
  import { UserDataUpdateChunkType } from '$lib/types';
  import { submitUserDataUpdateChunk } from '$lib/client/util/mutateUserDataUtilClient';
  import type {
    FlowListChangeOrderEntry,
    FlowListChangeOrderField
  } from '$lib/common/schema/mutateUserDataSchema';

  function openNewFlowModal() {
    $newFlowModalOpen = true;
  }

  function deleteFlow() {
    const idx = $selectedFlowIndex;
    const id = $userFlowcharts[idx].id;

    // unselect
    $selectedFlowIndex = -1;

    // delete
    submitUserDataUpdateChunk({
      type: UserDataUpdateChunkType.FLOW_DELETE,
      data: {
        id
      }
    });

    // correct pos
    const flowchartIdsToReorder = $userFlowcharts.filter((_, flowIdx) => flowIdx > idx);
    const reorderEntries: FlowListChangeOrderEntry[] = flowchartIdsToReorder.map(
      (flow, flowIdx) => ({
        id: flow.id,
        pos: idx + flowIdx
      })
    );

    if (reorderEntries.length) {
      submitUserDataUpdateChunk({
        type: UserDataUpdateChunkType.FLOW_LIST_CHANGE,
        data: {
          // typecast safe here bc we check to make sure we have things to reorder
          order: reorderEntries as FlowListChangeOrderField
        }
      });
    }
  }
</script>

<div>
  <div class="flex justify-center">
    <button class="flex-1 mx-1 btn btn-almostmd btn-accent" on:click={openNewFlowModal}
      >New Flow</button
    >
    <button
      class="flex-1 mx-1 btn btn-almostmd bg-gray-400 border-none hover:bg-gray-500"
      disabled={$selectedFlowIndex === -1}>Actions</button
    >
    <button
      class="flex-1 mx-1 btn btn-almostmd bg-red-500 border-none hover:bg-red-600"
      disabled={$selectedFlowIndex === -1}
      on:click={() => {
        if (
          confirm(
            `Are you sure you want to delete the flowchart "${$userFlowcharts[$selectedFlowIndex].name}"?`
          )
        ) {
          deleteFlow();
        }
      }}>Delete Flow</button
    >
  </div>
</div>
