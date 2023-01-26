<script lang="ts">
  import Fa from 'svelte-fa';
  import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import type { ActionData, PageData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  let password = '';
  let loading = false;
  let loginText = 'Sign In';
</script>

<main class="container mx-auto grid sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
  <div class="card shadow mt-8 sm:col-start-1 lg:col-start-2 xl:col-start-3 col-span-3">
    <div class="card-body">
      <h2 class="card-title justify-center font-medium text-4xl text-polyGreen">Sign In</h2>
      <div class="divider" />

      {#if data.cameFromRegister}
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
            <span>Account successfully created! Please login.</span>
          </div>
        </div>
      {/if}

      {#if !form?.success && $page.status === 401}
        <div class="alert alert-error shadow-lg mb-6">
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
            <span>Incorrect email address and/or password.</span>
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
            <span>An error occurred when attempting login. Please try again a bit later.</span>
          </div>
        </div>
      {/if}

      <form
        method="POST"
        use:enhance={() => {
          loading = true;
          loginText = 'Signing In ...';
          return async ({ update }) => {
            loading = false;
            loginText = 'Sign In';
            // always reset so that we don't see two alerts at the same time
            data.cameFromRegister = false;
            await update();
            // reset pw field on failed POST bc form is only reset on success response
            if ($page.status === 400 || $page.status === 401) {
              password = '';
            }
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
          {#if form?.loginValidationErrors?.email}
            <small id="emailError" class="text-red-600 label label-text-alt"
              >{form?.loginValidationErrors?.email[0]}</small
            >
          {/if}

          <label class="input-group w-full mt-6">
            <span><Fa icon={faLock} /></span>
            <label class="sr-only" for="password">Password</label>
            <input
              bind:value={password}
              class="input input-bordered mx-auto w-full"
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              required
            />
          </label>
          {#if form?.loginValidationErrors?.password}
            <small id="passwordError" class="text-red-600 label label-text-alt"
              >{form?.loginValidationErrors?.password[0]}</small
            >
          {/if}

          <button
            class="btn btn-accent btn-block mt-6"
            class:loading
            disabled={loading}
            type="submit"
          >
            {loginText}
          </button>
        </div>
      </form>

      <div class="divider" />

      <div class="flex flex-row w-full justify-center">
        <a href="/forgotpassword" class="hyperlink">Forgot your password?</a>
        <div class="divider divider-horizontal" />
        <a href="/register" class="hyperlink">Create an account</a>
      </div>
    </div>
  </div>
</main>
