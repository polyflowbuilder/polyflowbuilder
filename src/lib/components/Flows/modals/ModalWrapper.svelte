<script lang="ts">
  import { AddTermsModal, NewFlowModal } from '$lib/components/Flows/modals';
  import { startYearsData, catalogYearsData, programData } from '$lib/client/stores/apiDataStore';
</script>

<div>
  <NewFlowModal
    startYearsData={$startYearsData}
    catalogYearsData={$catalogYearsData}
    programData={$programData}
  />
  <AddTermsModal />
</div>
