<script lang="ts">
  import Fa from 'svelte-fa';
  import { faSortDown } from '@fortawesome/free-solid-svg-icons';

  export let actionsButtonDisabled: boolean;
</script>

<div class="dropdown">
  <button
    tabindex="0"
    class="flex-1 mx-1 btn btn-almostmd bg-gray-400 border-none hover:bg-gray-500"
    disabled={actionsButtonDisabled}
  >
    Actions
    <span class="ml-1 mb-1">
      <Fa icon={faSortDown} />
    </span>
  </button>

  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <ul tabindex="0" class="mt-1 p-2 shadow menu menu-compact dropdown-content bg-base-100">
    <li><a>hello1</a></li>
    <li><a>hello2</a></li>
    <li><a>hello3</a></li>
    <li><a>hello4</a></li>
  </ul>
</div>
