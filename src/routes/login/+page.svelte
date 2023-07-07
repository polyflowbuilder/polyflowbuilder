<script lang="ts">
  import Fa from 'svelte-fa';
  import { page } from '$app/stores';
  import { enhance } from '$app/forms';
  import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
  import { AlertError, AlertSuccess } from '$lib/components/common';

  export let data;
  export let form;

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
        <AlertSuccess text="Account successfully created! Please login." addlClass="mb-6" />
      {/if}

      {#if data.cameFromResetPassword}
        <AlertSuccess text="Password successfully reset! Please login." addlClass="mb-6" />
      {/if}

      {#if data.cameFromUnauthorized}
        <AlertError
          text="You are unauthorized to access the requested resource. Please sign in."
          addlClass="mb-6"
        />
      {/if}

      {#if !form?.success && $page.status === 401}
        <AlertError text="Incorrect email address and/or password." addlClass="mb-6" />
      {/if}

      {#if form?.error}
        <AlertError
          text="An error occurred when attempting login. Please try again a bit later."
          addlClass="mb-6"
        />
      {/if}

      <form
        method="POST"
        use:enhance={() => {
          loading = true;
          loginText = 'Signing In ...';
          return async ({ update }) => {
            // always reset so that we don't see multiple alerts at the same time
            data.cameFromRegister = false;
            data.cameFromResetPassword = false;
            data.cameFromUnauthorized = false;
            await update();
            // on success, dont disable loader so continuity is not broken on enhanced page
            if ($page.status !== 200) {
              loading = false;
              loginText = 'Sign In';
            }
            // reset pw field on failed POST bc form is only reset on success response
            if ($page.status === 400 || $page.status === 401) {
              password = '';
            }
          };
        }}
      >
        <div class="form-control">
          <label class="join group-input">
            <span class="join-item"><Fa icon={faUser} /></span>
            <label class="sr-only" for="email">Email</label>
            <input
              class="input join-item input-bordered mx-auto w-full"
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

          <label class="join group-input mt-6">
            <span class="join-item"><Fa icon={faLock} /></span>
            <label class="sr-only" for="password">Password</label>
            <input
              bind:value={password}
              class="input join-item input-bordered mx-auto w-full"
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
            disabled={loading}
            type="submit"
          >
            <span class={loading ? 'loading loading-spinner' : ''}/>
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
