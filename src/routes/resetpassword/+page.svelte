<script lang="ts">
  import Fa from 'svelte-fa';
  import { page } from '$app/stores';
  import { faLock } from '@fortawesome/free-solid-svg-icons';
  import { enhance } from '$app/forms';
  import { AlertError } from '$lib/components/common';
  import type { ActionData, PageData } from './$types';

  export let form: ActionData;
  export let data: PageData;

  let password = '';
  let passwordConfirm = '';
  let loading = false;
  let resetText = 'Reset Password';
</script>

<main class="container mx-auto grid sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
  <div class="card shadow mt-8 sm:col-start-1 lg:col-start-2 xl:col-start-3 col-span-3">
    <div class="card-body">
      <h2 class="card-title justify-center font-medium text-4xl text-polyGreen">Reset Password</h2>
      <div class="divider" />

      {#if !form?.success && form?.tokenExpired}
        <AlertError
          text="Password reset token expired. Please try the reset process again."
          addlClass="mb-4"
        />
      {/if}

      {#if form?.error}
        <AlertError
          text="An error occurred while attempting to reset your password. Please try again a bit
      later."
          addlClass="mb-4"
        />
      {/if}

      <p class="mb-4">Enter a new password below to reset your account password.</p>

      <form
        method="POST"
        use:enhance={() => {
          loading = true;
          resetText = 'Resetting Password ...';
          return async ({ update }) => {
            loading = false;
            resetText = 'Reset Password';
            await update();
            // on success, dont disable loader so continuity is not broken on enhanced page
            if ($page.status !== 200) {
              loading = false;
              resetText = 'Reset Password';
            }
            // reset pw field on failed POST bc form is only reset on success response
            if ($page.status === 400 || $page.status === 401) {
              password = '';
              passwordConfirm = '';
            }
          };
        }}
      >
        <div class="form-control">
          <label class="input-group w-full mt-6">
            <span><Fa icon={faLock} /></span>
            <label class="sr-only" for="password">Password</label>
            <input
              class="input input-bordered mx-auto w-full"
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              bind:value={password}
              required
            />
          </label>
          {#if form?.resetPasswordValidationErrors?.password}
            <small id="passwordError" class="text-red-600 label label-text-alt"
              >{form?.resetPasswordValidationErrors?.password[0]}</small
            >
          {/if}

          <label class="input-group w-full mt-6">
            <span><Fa icon={faLock} /></span>
            <label class="sr-only" for="passwordConfirm">Repeat Password</label>
            <input
              class="input input-bordered mx-auto w-full"
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              placeholder="Repeat Password"
              bind:value={passwordConfirm}
              required
            />
          </label>
          {#if form?.resetPasswordValidationErrors?.passwordConfirm}
            <small id="passwordConfirmError" class="text-red-600 label label-text-alt"
              >{form?.resetPasswordValidationErrors?.passwordConfirm[0]}</small
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

        <input type="hidden" id="resetEmail" name="resetEmail" value={data?.resetEmail} />
        <input type="hidden" id="resetToken" name="resetToken" value={data?.resetToken} />
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
