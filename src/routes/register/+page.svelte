<script lang="ts">
  import Fa from 'svelte-fa';
  import { faUser, faLock, faEnvelope } from '@fortawesome/free-solid-svg-icons';

  let username = '';
  let email = '';
  let password = '';
  let passwordConfirm = '';
  $: valid = username && email && password && passwordConfirm;

  let loading = false;
  let registerText = 'Create Account!';
</script>

<main class="container mx-auto grid sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
  <div class="card shadow mt-8 sm:col-start-1 lg:col-start-2 xl:col-start-3 col-span-3">
    <div class="card-body">
      <h2 class="card-title justify-center font-medium text-4xl text-polyGreen">Create Account</h2>
      <div class="divider" />

      <p class="mb-4">
        Please fill out the following information to create a PolyFlowBuilder account.
      </p>

      <form method="POST">
        <div class="form-control">
          <label class="input-group w-full">
            <span><Fa icon={faUser} /></span>
            <label class="sr-only" for="username">Username</label>
            <input
              bind:value={username}
              class="input input-bordered mx-auto w-full"
              type="text"
              id="username"
              name="username"
              placeholder="Username"
              required
            />
          </label>

          <label class="input-group w-full mt-6">
            <span><Fa icon={faEnvelope} /></span>
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

          <label class="input-group w-full mt-6">
            <span><Fa icon={faLock} /></span>
            <label class="sr-only" for="passwordConfirm">Repeat Password</label>
            <input
              bind:value={passwordConfirm}
              class="input input-bordered mx-auto w-full"
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              placeholder="Repeat Password"
              required
            />
          </label>

          <button
            class="btn btn-accent btn-block mt-6"
            class:loading
            disabled={!valid}
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
