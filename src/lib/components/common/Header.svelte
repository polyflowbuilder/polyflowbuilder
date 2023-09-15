<script lang="ts">
  import Fa from 'svelte-fa';
  import { page } from '$app/stores';
  import { faGithub, faDiscord } from '@fortawesome/free-brands-svg-icons';
  import { goto, invalidateAll } from '$app/navigation';
  import { PUBLIC_PFB_DISCORD_LINK, PUBLIC_PFB_GITHUB_LINK } from '$env/static/public';
  import { faBell, faBars, faSignOutAlt, faUserTimes } from '@fortawesome/free-solid-svg-icons';

  async function logout(deleteAcc = false) {
    try {
      if (
        deleteAcc &&
        !confirm('Are you sure you want to delete your account? This cannot be undone!')
      ) {
        return;
      }

      const res = await fetch(`/api/auth/login${deleteAcc ? '?deleteAcc=1' : ''}`, {
        method: 'DELETE'
      });

      switch (res.status) {
        // both of these will do a redirect
        case 200:
        case 400: {
          await goto('/');
          await invalidateAll();
          break;
        }
        case 500: {
          throw new Error('Internal Server Error.');
        }
      }
    } catch (error) {
      alert(
        'An error occurred while trying to log out. Please save your data and refresh the page, or file a bug report if this persists. Error: ' +
          (error as Error).message
      );
    }
  }
</script>

<header class="navbar px-0 shadow-md bg-gray-100 text-neutral-content z-10">
  <div class="flex-none px-2 mx-2">
    <div class="dropdown">
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label
        tabindex="0"
        class="btn btn-md bg-base-200 hover:bg-gray-300 border-none text-gray-600 mr-2 lg:hidden"
      >
        <Fa icon={faBars} scale={1.5} />
      </label>
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <ul tabindex="0" class="menu dropdown-content mt-2 p-2 shadow bg-base-100 w-52">
        <li class="text-gray-600">
          <a href="/about" class="relative">About</a>
        </li>
        <li class="text-gray-600">
          <a href="/feedback" class="relative">Submit Feedback</a>
        </li>
        <li class="text-gray-600">
          <a href={PUBLIC_PFB_DISCORD_LINK} class="relative">Discord Server</a>
        </li>
        <li class="text-gray-600">
          <a href={PUBLIC_PFB_GITHUB_LINK} class="relative">GitHub Repository</a>
        </li>
      </ul>
    </div>

    <a href="/"><img src="/assets/logo.png" alt="PolyFlowBuilder logo" width="235" height="65" /></a
    >
  </div>
  <div class="flex-1">
    <div class="items-stretch hidden lg:flex px-2 mx-2">
      <a href="/about" class="text-gray-600 btn btn-ghost btn-md rounded-btn mr-2"> About </a>
      <a href="/feedback" class="text-gray-600 btn btn-ghost btn-md rounded-btn mr-2">
        Submit Feedback
      </a>
    </div>
  </div>
  <div class="flex">
    <div class="hidden lg:inline">
      <a
        href={PUBLIC_PFB_DISCORD_LINK}
        target="_blank"
        class="btn btn-md btn-ghost rounded-full hover:bg-gray-300 text-gray-600 transition"
      >
        <Fa icon={faDiscord} scale={1.8} />
      </a>
      <a
        href={PUBLIC_PFB_GITHUB_LINK}
        target="_blank"
        class="mr-2 btn btn-md btn-ghost rounded-full hover:bg-gray-300 text-gray-600 transition"
      >
        <Fa icon={faGithub} scale={1.8} />
      </a>
    </div>
    {#if $page.data.session}
      <div class="indicator">
        <!-- TODO: reimplement alert indicator when adding notifications -->
        <a
          href={'#'}
          class="hidden xs:inline-flex mr-2 btn btn-md btn-ghost rounded-full hover:bg-gray-300 text-gray-600 transition"
        >
          <Fa icon={faBell} scale={1.8} />
        </a>
      </div>
      <div class="dropdown dropdown-end">
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label
          tabindex="0"
          class="avatar w-8 xxs:w-10 mr-4 mt-2 xxs:ml-2 rounded-full ring ring-gray-300 hover:ring-gray-400 ring-offset-1 transition hover:cursor-pointer"
        >
          <div class="rounded-full">
            <img
              src={`https://ui-avatars.com/api/?name=${$page.data.session.username}`}
              alt="user"
            />
          </div>
        </label>
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <ul
          tabindex="0"
          class="mt-1 p-2 shadow menu menu-compact dropdown-content bg-base-100 w-56"
        >
          <li class="text-gray-800 pointer-events-none">
            <div class="w-52">
              <p class="overflow-hidden text-ellipsis m-auto font-semibold text-md">
                {$page.data.session.username}
              </p>
            </div>
          </li>
          <div class="divider m-0 p-0" />
          <li class="text-gray-800">
            <a href={'#'} class="relative" on:click|preventDefault={() => logout()}>
              Log Out
              <Fa icon={faSignOutAlt} class="right-4 absolute text-green-500" />
            </a>
          </li>
          <li class="text-gray-800">
            <a href={'#'} class="relative" on:click|preventDefault={() => logout(true)}>
              Delete Account
              <Fa icon={faUserTimes} class="right-3 absolute text-red-500" />
            </a>
          </li>
        </ul>
      </div>
    {:else}
      <a href="/login" class="btn btn-outline btn-md rounded-btn mr-3"> Sign In </a>
      <a href="/register" class="btn btn-outline btn-accent btn-md rounded-btn mr-4">
        Create Account
      </a>
    {/if}
  </div>
</header>
