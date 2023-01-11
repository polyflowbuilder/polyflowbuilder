<script lang="ts">
  import Fa from 'svelte-fa';
  import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
  import { enhance } from '$app/forms';

  // only used for button graying out
  let email = '';
  let password = '';
  $: valid = email && password;

  let loading = false;
  let loginText = 'Sign In';
</script>

<main class="container mx-auto grid sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
  <div class="card shadow mt-8 sm:col-start-1 lg:col-start-2 xl:col-start-3 col-span-3">
    <div class="card-body">
      <h2 class="card-title justify-center font-medium text-4xl text-polyGreen">Sign In</h2>
      <div class="divider" />

      <form
        method="POST"
        use:enhance={() => {
          loading = true;
          loginText = 'Signing In ...';
          return async ({ update }) => {
            loading = false;
            loginText = 'Sign In';
            await update();
          };
        }}
      >
        <div class="form-control">
          <label class="input-group w-full mb-6">
            <span><Fa icon={faUser} /></span>
            <label class="sr-only" for="email">Email</label>
            <input
              bind:value={email}
              class="input input-bordered mx-auto w-full"
              type="email"
              id="email"
              name="email"
              placeholder="Email address"
              required
            />
          </label>

          <label class="input-group w-full mb-6">
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

          <button
            class="btn btn-accent btn-block"
            class:loading
            disabled={!valid || loading}
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
