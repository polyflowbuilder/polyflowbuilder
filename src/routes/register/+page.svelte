<script lang="ts">
  import Fa from 'svelte-fa';
  import { faUser, faLock, faEnvelope } from '@fortawesome/free-solid-svg-icons';
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  export let form: ActionData;

  let loading = false;
  let registerText = 'Create Account!';
</script>

<main class="container mx-auto grid sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
  <div class="card shadow mt-8 sm:col-start-1 lg:col-start-2 xl:col-start-3 col-span-3">
    <div class="card-body">
      <h2 class="card-title justify-center font-medium text-4xl text-polyGreen">Create Account</h2>
      <div class="divider" />

      {#if !form?.success && form?.userExists}
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
              >An account with this email address already exists. Please use another email address.</span
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
              >An error occurred when registering your account. Please try again a bit later.</span
            >
          </div>
        </div>
      {/if}

      <p class="mb-4">
        Please fill out the following information to create a PolyFlowBuilder account.
      </p>

      <form
        method="POST"
        use:enhance={() => {
          loading = true;
          registerText = 'Creating Account ...';
          return async ({ update }) => {
            loading = false;
            registerText = 'Create Account!';
            await update();
          };
        }}
      >
        <div class="form-control">
          <label class="input-group w-full">
            <span><Fa icon={faUser} /></span>
            <label class="sr-only" for="username">Username</label>
            <input
              class="input input-bordered mx-auto w-full"
              type="text"
              id="username"
              name="username"
              placeholder="Username"
              value={form?.data?.username ?? ''}
              required
            />
          </label>
          {#if form?.registerValidationErrors?.username}
            <small class="text-red-600 label label-text-alt"
              >{form?.registerValidationErrors?.username[0]}</small
            >
          {/if}

          <label class="input-group w-full mt-6">
            <span><Fa icon={faEnvelope} /></span>
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
          {#if form?.registerValidationErrors?.email}
            <small class="text-red-600 label label-text-alt"
              >{form?.registerValidationErrors?.email[0]}</small
            >
          {/if}

          <label class="input-group w-full mt-6">
            <span><Fa icon={faLock} /></span>
            <label class="sr-only" for="password">Password</label>
            <input
              class="input input-bordered mx-auto w-full"
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              required
            />
          </label>
          {#if form?.registerValidationErrors?.password}
            <small class="text-red-600 label label-text-alt"
              >{form?.registerValidationErrors?.password[0]}</small
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
              required
            />
          </label>
          {#if form?.registerValidationErrors?.passwordConfirm}
            <small class="text-red-600 label label-text-alt"
              >{form?.registerValidationErrors?.passwordConfirm[0]}</small
            >
          {/if}

          <button
            class="btn btn-accent btn-block mt-6"
            class:loading
            disabled={loading}
            type="submit"
          >
            {registerText}
          </button>
        </div>
      </form>

      <div class="divider" />

      <div class="flex flex-row w-full justify-center">
        <a href="/login" class="hyperlink">Sign In</a>
      </div>
    </div>
  </div>
</main>
