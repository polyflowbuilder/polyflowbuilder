<script lang="ts">
  import { enhance } from '$app/forms';
  import { FEEDBACK_MESSAGE_MAX_LENGTH } from '$lib/config/common/feedbackConfig';
  import type { ActionData } from './$types';

  export let form: ActionData;

  let loading = false;
</script>

<main class="container mx-auto grid grid-cols-6 gap-4">
  <div class="card shadow mt-8 col-start-2 col-span-4">
    <div class="card-body">
      <h2 class="card-title font-medium justify-center text-4xl text-polyGreen">Submit Feedback</h2>
      <div class="divider mb-0" />

      {#if form?.success}
        <div class="alert alert-success shadow-lg my-2">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              /></svg
            >
            <span>Feedback successfully submitted!</span>
          </div>
        </div>
      {:else if form?.error}
        <div class="alert alert-error shadow-lg my-2">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              /></svg
            >
            <span
              >An error occurred while trying to submit feedback. Please try again a bit later.</span
            >
          </div>
        </div>
      {/if}

      <p class="my-2">
        Thank you for taking the time to submit feedback to improve PolyFlowBuilder! Please fill out
        the following:
      </p>

      <form
        method="POST"
        use:enhance={() => {
          loading = true;
          return async ({ update }) => {
            loading = false;
            await update();
          };
        }}
      >
        <div class="form-control">
          <label for="subject" class="font-semibold label label-text text-lg">Subject</label>
          <select class="select select-bordered" id="subject" name="subject">
            <option>General Comment</option>
            <option>Issue</option>
            <option>Feature Request</option>
            <option>Other</option>
          </select>
          <small class="text-gray-500 label label-text-alt">
            Let us know what type of feedback you are submitting!
            <br />
            If you are submitting an Issue, please make sure you have read the "Common Issues and Fixes"
            section within the PolyFlowBuilder CheatSheet (accessible via the blue question mark in the
            flow editor) before submitting a request.
          </small>

          <label for="email" class="font-semibold label label-text text-lg">Email</label>
          <input
            type="email"
            class="input input-bordered"
            id="email"
            name="email"
            placeholder="Email address"
          />
          <small class="text-gray-500 label label-text-alt">
            Let us know how to get in touch with you for a follow-up if necessary!
          </small>
          {#if form?.feedbackValidationErrors?.email}
            <small id="emailError" class="text-red-600 label label-text-alt"
              >{form?.feedbackValidationErrors?.email[0]}</small
            >
          {/if}

          <label for="feedback" class="font-semibold label label-text text-lg">Feedback</label>
          <textarea
            class="textarea h-56 textarea-bordered resize-none"
            id="feedback"
            name="feedback"
            placeholder="Enter your feedback here!"
            maxlength={FEEDBACK_MESSAGE_MAX_LENGTH}
            required
          />
          {#if form?.feedbackValidationErrors?.feedback}
            <small id="feedbackError" class="text-red-600 label label-text-alt"
              >{form?.feedbackValidationErrors?.feedback[0]}</small
            >
          {/if}

          <button class="btn btn-accent btn-block mt-6" class:loading type="submit"
            >Submit Feedback</button
          >
        </div>
      </form>
    </div>
  </div>
</main>
