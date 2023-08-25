<script lang="ts">
  import {
    programCache,
    availableFlowchartCatalogs,
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
    availableFlowchartCatalogs={$availableFlowchartCatalogs}
    programCache={$programCache}
  />
  <AddTermsModal />
  <DeleteTermsModal />
  <EditFlowPropertiesModal />
  <CustomizeCourseModal />
</div>
