<script lang="ts">
  import {
    programCache,
    catalogYearsData,
    availableFlowchartStartYears
  } from '$lib/client/stores/apiDataStore';
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
    availableFlowchartStartYears={$availableFlowchartStartYears}
    catalogYearsData={$catalogYearsData}
    programCache={$programCache}
  />
  <AddTermsModal />
  <DeleteTermsModal />
  <EditFlowPropertiesModal />
  <CustomizeCourseModal />
</div>
