<script lang="ts">
  import { selectedFlowIndex } from '$lib/client/stores/UIDataStore';
  import CourseSearchProgramSelector from './CourseSearchProgramSelector.svelte';

  let searchProgramIndex = -1;
  let query = '';

  // reset searches when we switch flows
  $: {
    $selectedFlowIndex;
    query = '';
    searchProgramIndex = $selectedFlowIndex !== -1 ? 0 : -1;
  }
</script>

<!-- TODO: add "template classes" like blanks and GEs here -->
<div>
  <h2 class="text-4xl font-medium text-polyGreen text-center">Add Courses</h2>

  <div class="mt-4">
    <CourseSearchProgramSelector bind:searchProgramIndex />

    <input
      class="mt-4 input input-bordered input-sm w-full"
      aria-label="course search query input"
      role="searchbox"
      placeholder="Search for courses to add"
      bind:value={query}
      disabled={$selectedFlowIndex === -1}
    />
  </div>

  <div class="divider my-4" />
</div>
