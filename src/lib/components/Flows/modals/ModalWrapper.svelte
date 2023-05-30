<script lang="ts">
  import { NewFlowModal, AddTermsModal, DeleteTermsModal } from '$lib/components/Flows/modals';
  import { startYearsData, catalogYearsData, programData } from '$lib/client/stores/apiDataStore';
</script>

<div>
  <NewFlowModal
    startYearsData={$startYearsData}
    catalogYearsData={$catalogYearsData}
    programData={$programData}
  />
  <AddTermsModal />
  <DeleteTermsModal />
</div>
