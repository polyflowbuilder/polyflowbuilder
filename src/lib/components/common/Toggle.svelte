<script lang="ts">
  export let name: string;
  export let checked = false;
</script>

<div>
  <label class="relative inline-flex items-center mr-5 cursor-pointer">
    <span class="sr-only">{name}</span>
    <input type="checkbox" bind:checked class="sr-only peer" />
    <div
      class="peer-focus:ring-base-300 peer-checked:bg-green-600 w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
    />
  </label>
</div>
