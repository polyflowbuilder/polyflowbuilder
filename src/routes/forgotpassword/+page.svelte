<script lang="ts">
  import Fa from 'svelte-fa';
  import { faUser } from '@fortawesome/free-solid-svg-icons';
  import { enhance } from '$app/forms';
  import { AlertError, AlertSuccess } from '$lib/components/common';

  export let form;
  export let data;

  let loading = false;
  let resetText = 'Submit Password Reset Request';
</script>

<main class="container mx-auto grid sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
  <div class="card shadow mt-8 sm:col-start-1 lg:col-start-2 xl:col-start-3 col-span-3">
    <div class="card-body">
      <h2 class="card-title justify-center font-medium text-4xl text-polyGreen">
        Request Password Reset
      </h2>
      <div class="divider" />

      {#if form?.success}
        <AlertSuccess
          text="An email to reset your password has been sent. Please check it!"
          addlClass="mb-6"
        />
      {/if}

      {#if data?.cameFromResetPassword}
        <AlertError
          text="The provided password reset link has expired or is incorrect. Please try the reset
      process again."
          addlClass="mb-4"
        />
      {/if}

      {#if form?.error}
        <AlertError
          text="An error occurred when sending the password reset request. Please try again a bit
      later."
          addlClass="mb-4"
        />
      {/if}

      <p class="mb-4">
        Enter your email address below. If we have it on file, we will send you an email to reset
        your password.
      </p>

      <form
        method="POST"
        use:enhance={() => {
          loading = true;
          resetText = 'Submitting Password Reset Request ...';
          return async ({ update }) => {
            loading = false;
            resetText = 'Submit Password Reset Request';
            await update();
          };
        }}
      >
        <div class="form-control">
          <label class="input-group w-full">
            <span><Fa icon={faUser} /></span>
            <label class="sr-only" for="email">Email</label>
            <input
              class="input input-bordered mx-auto w-full"
              type="email"
              id="email"
              name="email"
              placeholder="Email address"
              value={form?.data?.email ?? ''}
              required
            />
          </label>
          {#if form?.forgotPasswordValidationErrors?.email}
            <small id="emailError" class="text-red-600 label label-text-alt"
              >{form?.forgotPasswordValidationErrors?.email[0]}</small
            >
          {/if}

          <button
            class="btn btn-accent btn-block mt-6"
            class:loading
            disabled={loading}
            type="submit"
          >
            {resetText}
          </button>
        </div>
      </form>

      <div class="divider" />

      <div class="flex flex-row w-full justify-center">
        <a href="/login" class="hyperlink">Sign In</a>
        <div class="divider divider-horizontal" />
        <a href="/register" class="hyperlink">Create an account</a>
      </div>
    </div>
  </div>
</main>
