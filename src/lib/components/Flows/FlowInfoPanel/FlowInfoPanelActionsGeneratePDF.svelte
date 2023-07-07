<script lang="ts">
  import { userFlowcharts } from '$lib/client/stores/userDataStore';
  import { selectedFlowIndex } from '$lib/client/stores/UIDataStore';

  let generatingPDF = false;

  async function generatePDF() {
    generatingPDF = true;

    // send request
    const searchParams = new URLSearchParams({
      flowchartId: $userFlowcharts[$selectedFlowIndex]?.id
    });
    await fetch(`/api/data/generatePDF?${searchParams.toString()}`)
      .then(async (resp) => {
        switch (resp.status) {
          case 200: {
            const blob = await resp.blob();
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `PolyFlowBuilder_${
              $userFlowcharts[$selectedFlowIndex]?.name
            }_${new Date().toUTCString()}`;
            link.click();
            link.remove();
            break;
          }
          case 401:
            alert(
              'The request to export this flowchart as a PDF was unauthenticated. Please refresh the page and try again.'
            );
            break;
          default:
            alert(
              'An error occurred while trying to export this flowchart as a PDF. Please refresh the page, and submit a bug report if this error persists.'
            );
        }
      })
      .catch((err) => {
        alert(
          'An error occurred while trying to export this flowchart as a PDF. Please refresh the page, and submit a bug report if this error persists.'
        );
        console.error('unexpected error on PDF generate:', err);
      })
      .finally(() => (generatingPDF = false));
  }
</script>

<li class:disabled={generatingPDF} class:pointer-events-none={generatingPDF}>
  <a href={'#'} class="flex justify-between" on:click|preventDefault={generatePDF}>
    <span>Export Flow as PDF</span>
    {#if generatingPDF}
      <span class="loading loading-spinner loading-sm text-polyGreen" />
    {/if}
  </a>
</li>