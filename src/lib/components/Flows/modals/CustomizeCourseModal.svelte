<script lang="ts">
  import { modal } from '$lib/client/util/modalUtil';
  import { userFlowcharts } from '$lib/client/stores/userDataStore';
  import { updateCourseData } from '$lib/client/util/flowActionsUtil';
  import { validateUnitString } from '$lib/client/util/unitCounterUtilClient';
  import { courseCache, programData } from '$lib/client/stores/apiDataStore';
  import { customizeCoursesModalOpen } from '$lib/client/stores/modalStateStore';
  import { UPDATE_CHUNK_DELAY_TIME_MS } from '$lib/client/config/editorConfig';
  import { getCatalogFromProgramIDIndex } from '$lib/common/util/courseDataUtilCommon';
  import { selectedCourses, selectedFlowIndex } from '$lib/client/stores/UIDataStore';
  import {
    CUSTOM_COURSE_DESC_MAX_LENGTH,
    CUSTOM_COURSE_DISPLAY_NAME_MAX_LENGTH,
    CUSTOM_COURSE_NAME_MAX_LENGTH
  } from '$lib/common/config/flowDataConfig';
  import type { Course } from '$lib/common/schema/flowchartSchema';

  let newCourseName = '';
  let newCourseDisplayName = '';
  let newCourseDescription = '';
  let newCourseUnits = '';

  let initCourseName = '';
  let initCourseDisplayName = '';
  let initCourseDescription = '';
  let initCourseUnits = '';

  // put reactive statements in this order bc if validation updates
  // are ran before updateModalInputs updates, the state will be out-of-sync

  $: selectedCoursesData = getSelectedCourses($selectedCourses);
  $: {
    $customizeCoursesModalOpen;
    updateModalInputs(selectedCoursesData);
  }

  // validation
  $: newCourseNameValid =
    newCourseName.length > 0 && newCourseName.length <= CUSTOM_COURSE_NAME_MAX_LENGTH;
  $: newCourseDisplayNameValid = newCourseName.length <= CUSTOM_COURSE_DISPLAY_NAME_MAX_LENGTH;
  $: newCourseDescriptionValid = newCourseDescription.length <= CUSTOM_COURSE_DESC_MAX_LENGTH;
  $: newCourseUnitsValid = validateUnitString(newCourseUnits);
  $: courseChangesValid =
    newCourseNameValid &&
    newCourseDisplayNameValid &&
    newCourseDescriptionValid &&
    newCourseUnitsValid &&
    (newCourseName !== initCourseName ||
      newCourseDisplayName !== initCourseDisplayName ||
      newCourseDescription !== initCourseDescription ||
      newCourseUnits !== initCourseUnits);

  function getSelectedCourses(selectedCourses: Set<string>) {
    const courseData: Course[] = [];

    selectedCourses.forEach((entry) => {
      const [tIndex, cIndex] = entry.split(',').map((val) => Number(val));
      const course = $userFlowcharts[$selectedFlowIndex]?.termData.find(
        (term) => term.tIndex === tIndex
      )?.courses[cIndex];

      // TODO: find better way to raise errors on frontend (check all frontend code for this also)
      if (!course) {
        throw new Error(
          'unable to find course for single selected course in customize course modal'
        );
      }

      courseData.push(course);
    });

    return courseData;
  }

  function updateModalInputs(courseData: Course[]) {
    if (courseData.length === 1) {
      const course = courseData[0];
      if (course.id === null) {
        if (!course.customId) {
          throw new Error('customId is null for a custom course');
        }

        newCourseName = course.customId;
        newCourseDisplayName = course.customDisplayName ?? '';
        newCourseDescription = course.customDesc ?? '';
        newCourseUnits = course.customUnits ?? '0';
      } else {
        // perform lookup if course is standard
        const courseCatalog = getCatalogFromProgramIDIndex(
          course.programIdIndex ?? 0,
          $userFlowcharts[$selectedFlowIndex].programId,
          $programData
        );
        const courseMetadata = $courseCache
          .find((cache) => cache.catalog === courseCatalog)
          ?.courses.find((c) => c.id === course.id);

        if (!courseMetadata) {
          throw new Error('unable to find course metadata for standard course in customize course');
        }

        newCourseName = courseMetadata.id;
        newCourseDisplayName = courseMetadata.displayName;
        newCourseDescription = courseMetadata.desc;

        // customUnits always take precedence
        newCourseUnits = course.customUnits ?? courseMetadata.units;
      }

      // don't allow save changes if no edits were made
      initCourseName = newCourseName;
      initCourseDisplayName = newCourseDisplayName;
      initCourseDescription = newCourseDescription;
      initCourseUnits = newCourseUnits;
    } else {
      initCourseName = '';
      initCourseDisplayName = '';
      initCourseDescription = '';
      initCourseUnits = '';

      newCourseName = 'Multiple courses selected';
      newCourseDisplayName = '';
      newCourseDescription = 'Changes made here will apply to all selected courses.';
      newCourseUnits = '';
    }
  }

  function submitUpdateCourseData() {
    updateCourseData(
      $userFlowcharts[$selectedFlowIndex]?.id,
      $userFlowcharts[$selectedFlowIndex]?.termData,
      $selectedCourses,
      {
        name: newCourseName,
        displayName: newCourseDisplayName,
        desc: newCourseDescription,
        units: newCourseUnits,
        onlyUnitsChange:
          newCourseUnits !== initCourseUnits &&
          newCourseName === initCourseName &&
          newCourseDisplayName === initCourseDisplayName &&
          newCourseDescription === initCourseDescription
      }
    );

    closeModal();

    setTimeout(() => ($selectedCourses = $selectedCourses), UPDATE_CHUNK_DELAY_TIME_MS + 1);
  }

  function closeModal() {
    $customizeCoursesModalOpen = false;
  }
</script>

<dialog use:modal={customizeCoursesModalOpen} class="modal">
  <div class="modal-box">
    <h2 class="text-3xl font-medium text-polyGreen text-center">
      Customize {selectedCoursesData.length === 1 ? 'Course' : 'Courses'}
    </h2>

    <div class="divider" />

    <div class="form-control">
      <!-- courses type -->
      <div class="label">
        <span>{selectedCoursesData.length === 1 ? 'Course' : 'Courses'} Type:</span>
        {#if selectedCoursesData.every((course) => course.id !== null)}
          <div class="badge rounded-sm border-none bg-emerald-500 text-white">Standard</div>
        {:else if selectedCoursesData.every((course) => course.id === null)}
          <div class="badge rounded-sm border-none bg-sky-500 text-white">Custom</div>
        {:else}
          <div class="badge rounded-sm border-none bg-amber-500 text-white">Varied</div>
        {/if}
      </div>

      <!-- course name -->
      <label class="label mt-2" for="courseName">
        <span class="text-base">Course Name:</span>
        <span
          class="text-sm"
          class:text-red-600={!newCourseNameValid}
          class:text-green-700={newCourseNameValid}
        >
          ({newCourseName.length}/{CUSTOM_COURSE_NAME_MAX_LENGTH})
        </span>
      </label>
      <label>
        <span class="sr-only">Course Name</span>
        <input
          class="input input-bordered input-sm w-full"
          name="courseName"
          type="text"
          placeholder="My Course Name"
          minlength="1"
          required
          bind:value={newCourseName}
        />
      </label>

      <!-- course display name -->
      <label class="label mt-2" for="courseDisplayName">
        <span class="text-base">Course Display Name:</span>
        <span
          class="text-sm"
          class:text-red-600={!newCourseDisplayNameValid}
          class:text-green-700={newCourseDisplayNameValid}
        >
          ({newCourseDisplayName.length}/{CUSTOM_COURSE_DISPLAY_NAME_MAX_LENGTH})
        </span>
      </label>
      <label>
        <span class="sr-only">Course Display Name</span>
        <input
          class="input input-bordered input-sm w-full"
          name="courseDisplayName"
          type="text"
          placeholder="My Course Display Name"
          bind:value={newCourseDisplayName}
        />
      </label>

      <!-- course description -->
      <label class="label mt-2" for="courseDescription">
        <span class="text-base">Course Description:</span>
        <span
          class="text-sm"
          class:text-red-600={!newCourseDescriptionValid}
          class:text-green-700={newCourseDescriptionValid}
        >
          ({newCourseDescription.length}/{CUSTOM_COURSE_DESC_MAX_LENGTH})
        </span>
      </label>
      <label>
        <span class="sr-only">Course Description</span>
        <textarea
          class="textarea textarea-bordered textarea-sm w-full h-40 resize-none"
          name="courseDescription"
          placeholder="My Course Description"
          bind:value={newCourseDescription}
        />
      </label>
    </div>

    <!-- course units -->
    <label class="label mt-2" for="courseUnits">
      <span class="text-base">Course Units:</span>
    </label>
    <label>
      <span class="sr-only">Course Units</span>
      <input
        class="input input-bordered input-sm w-full"
        name="courseUnits"
        type="text"
        placeholder="My Course Units"
        bind:value={newCourseUnits}
      />
    </label>
    {#if !newCourseUnitsValid}
      <small class="text-red-600 label label-text-alt">
        Invalid units. Valid units are either a single number [0,99] (e.g. "3"), or a range of two
        distinct numbers in ascending order [0,99] (e.g. "3-5").
      </small>
    {/if}

    <div class="flex mt-4">
      <button
        class="btn btn-almostmd btn-accent flex-1"
        disabled={!courseChangesValid}
        on:click={submitUpdateCourseData}>Save Changes</button
      >
      <div class="divider divider-horizontal" />
      <button class="btn btn-almostmd flex-1" on:click={closeModal}>Cancel</button>
    </div>
  </div>
</dialog>

<style lang="postcss">
  /* expand modal size */
  .modal-box {
    max-width: 48rem;
  }
</style>
