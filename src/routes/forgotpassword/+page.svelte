<script lang="ts">
  import Fa from 'svelte-fa';
  import { faUser } from '@fortawesome/free-solid-svg-icons';
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';

  export let form: ActionData;
  export let data: PageData;

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
        <div class="alert alert-success shadow-lg mb-6">
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
            <span>An email to reset your password has been sent. Please check it!</span>
          </div>
        </div>
      {/if}

      {#if data?.cameFromResetPassword}
        <div class="alert alert-error shadow-lg mb-4">
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
              >The provided password reset link has expired or is incorrect. Please try the reset
              process again.</span
            >
          </div>
        </div>
      {/if}

      {#if form?.error}
        <div class="alert alert-error shadow-lg mb-4">
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
              >An error occurred when sending the password reset request. Please try again a bit
              later.</span
            >
          </div>
        </div>
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
