<script lang="ts">
  import { startYearsData, catalogYearsData, programCache } from '$lib/client/stores/apiDataStore';
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
    programCache={$programCache}
  />
  <AddTermsModal />
  <DeleteTermsModal />
  <EditFlowPropertiesModal />
  <CustomizeCourseModal />
</div>
