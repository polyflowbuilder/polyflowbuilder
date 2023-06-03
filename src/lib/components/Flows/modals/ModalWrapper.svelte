<script lang="ts">
  import { startYearsData, catalogYearsData, programData } from '$lib/client/stores/apiDataStore';
  import {
    NewFlowModal,
    AddTermsModal,
    DeleteTermsModal,
    EditFlowPropertiesModal,
    CustomizeCourseModal
  } from '$lib/components/Flows/modals';
</script>

<div>
  <NewFlowModal
    startYearsData={$startYearsData}
    catalogYearsData={$catalogYearsData}
    programData={$programData}
  />
  <AddTermsModal />
  <DeleteTermsModal />
  <EditFlowPropertiesModal />
  <CustomizeCourseModal />
</div>
