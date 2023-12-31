<script lang="ts">
  import { enhance } from '$app/forms';
  import { AlertError, AlertSuccess } from '$lib/components/common';
  import { FEEDBACK_MESSAGE_MAX_LENGTH } from '$lib/common/config/feedbackConfig';
  import type { ActionData } from './$types';

  export let form: ActionData;

  let loading = false;
  let feedbackText = '';
</script>

<main class="container mx-auto grid grid-cols-6 gap-4">
  <div class="card shadow mt-8 col-start-2 col-span-4">
    <div class="card-body">
      <h2 class="card-title font-medium justify-center text-4xl text-polyGreen">Submit Feedback</h2>
      <div class="divider mb-0" />

      {#if form?.success}
        <AlertSuccess text="Feedback successfully submitted!" addlClass="my-2" />
      {:else if form?.error}
        <AlertError
          text="An error occurred while trying to submit feedback. Please try again a bit later."
          addlClass="my-2"
        />
      {/if}

      <p class="my-2">
        Thank you for taking the time to submit feedback to improve PolyFlowBuilder! Please fill out
        the following:
      </p>

      <form
        method="POST"
        use:enhance={() => {
          loading = true;
          return ({ update }) => {
            void (async () => {
              loading = false;
              feedbackText = '';
              await update();
            })();
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
              >{form.feedbackValidationErrors.email[0]}</small
            >
          {/if}

          <label for="feedback" class="font-semibold label label-text text-lg">
            <span>Feedback</span>
            <span
              class="text-sm font-normal"
              class:text-red-600={!feedbackText.length}
              class:text-green-700={feedbackText.length}
              >({feedbackText.length}/{FEEDBACK_MESSAGE_MAX_LENGTH})
            </span>
          </label>
          <textarea
            class="textarea h-56 textarea-bordered resize-none"
            id="feedback"
            name="feedback"
            placeholder="Enter your feedback here!"
            maxlength={FEEDBACK_MESSAGE_MAX_LENGTH}
            required
            bind:value={feedbackText}
          />
          {#if form?.feedbackValidationErrors?.feedback}
            <small id="feedbackError" class="text-red-600 label label-text-alt"
              >{form.feedbackValidationErrors.feedback[0]}</small
            >
          {/if}

          <button
            class="btn btn-accent btn-block mt-6"
            disabled={loading || !feedbackText.length}
            type="submit"
          >
            <span class={loading ? 'loading loading-spinner' : ''} />
            Submit Feedback
          </button>
        </div>
      </form>
    </div>
  </div>
</main>
