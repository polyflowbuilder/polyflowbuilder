<script lang="ts">
  import Fa from 'svelte-fa';
  import { page } from '$app/stores';
  import { enhance } from '$app/forms';
  import { AlertError } from '$lib/components/common';
  import { faUser, faLock, faEnvelope } from '@fortawesome/free-solid-svg-icons';
  import type { ActionData } from './$types';

  export let form: ActionData;

  let password = '';
  let passwordConfirm = '';
  let loading = false;
  let registerText = 'Create Account!';
</script>

<main class="container mx-auto grid sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
  <div class="card shadow mt-8 sm:col-start-1 lg:col-start-2 xl:col-start-3 col-span-3">
    <div class="card-body">
      <h2 class="card-title justify-center font-medium text-4xl text-polyGreen">Create Account</h2>
      <div class="divider" />

      {#if $page.status === 400 && form?.data.userExists}
        <AlertError
          text="An account with this email address already exists. Please use another email address."
          addlClass="mb-4"
        />
      {/if}

      {#if $page.status === 500}
        <AlertError
          text="An error occurred when registering your account. Please try again a bit later."
          addlClass="mb-4"
        />
      {/if}

      <p class="mb-4">
        Please fill out the following information to create a PolyFlowBuilder account.
      </p>

      <form
        method="POST"
        use:enhance={() => {
          loading = true;
          registerText = 'Creating Account ...';
          return ({ update }) => {
            void (async () => {
              loading = false;
              registerText = 'Create Account!';
              await update();
              // on success, dont disable loader so continuity is not broken on enhanced page
              if ($page.status !== 201) {
                loading = false;
                registerText = 'Create Account!';
              }
              // reset pw fields on failed POST bc form is only reset on success response
              if ($page.status === 400) {
                password = '';
                passwordConfirm = '';
              }
            })();
          };
        }}
      >
        <div class="form-control">
          <label class="join group-input">
            <span class="join-item"><Fa icon={faUser} /></span>
            <label class="sr-only" for="username">Username</label>
            <input
              class="input join-item input-bordered mx-auto w-full"
              type="text"
              id="username"
              name="username"
              placeholder="Username"
              value={form?.data.username ?? ''}
              required
            />
          </label>
          {#if form?.data.registerValidationErrors?.username}
            <small id="usernameError" class="text-red-600 label label-text-alt"
              >{form.data.registerValidationErrors.username[0]}</small
            >
          {/if}

          <label class="join group-input mt-6">
            <span class="join-item"><Fa icon={faEnvelope} /></span>
            <label class="sr-only" for="email">Email</label>
            <input
              class="input join-item input-bordered mx-auto w-full"
              type="email"
              id="email"
              name="email"
              placeholder="Email address"
              value={form?.data.email ?? ''}
              required
            />
          </label>
          {#if form?.data.registerValidationErrors?.email}
            <small id="emailError" class="text-red-600 label label-text-alt"
              >{form.data.registerValidationErrors.email[0]}</small
            >
          {/if}

          <label class="join group-input mt-6">
            <span class="join-item"><Fa icon={faLock} /></span>
            <label class="sr-only" for="password">Password</label>
            <input
              class="input join-item input-bordered mx-auto w-full"
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              bind:value={password}
              required
            />
          </label>
          {#if form?.data.registerValidationErrors?.password}
            <small id="passwordError" class="text-red-600 label label-text-alt"
              >{form.data.registerValidationErrors.password[0]}</small
            >
          {/if}

          <label class="join group-input mt-6">
            <span class="join-item"><Fa icon={faLock} /></span>
            <label class="sr-only" for="passwordConfirm">Repeat Password</label>
            <input
              class="input join-item input-bordered mx-auto w-full"
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              placeholder="Repeat Password"
              bind:value={passwordConfirm}
              required
            />
          </label>
          {#if form?.data.registerValidationErrors?.passwordConfirm}
            <small id="passwordConfirmError" class="text-red-600 label label-text-alt"
              >{form.data.registerValidationErrors.passwordConfirm[0]}</small
            >
          {/if}

          <button class="btn btn-accent btn-block mt-6" disabled={loading} type="submit">
            <span class={loading ? 'loading loading-spinner' : ''} />
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
