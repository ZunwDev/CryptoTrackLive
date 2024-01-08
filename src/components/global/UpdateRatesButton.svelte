<script lang="ts">
  import { updateRate } from "@store/store";
  import { UPDATE_RATES } from "@util/constants";
  import { Icon } from "svelte-awesome";
  import { refresh, chevronDown } from "svelte-awesome/icons";

  export let classProp: string = "";
</script>

<div class="relative">
  <!-- Update Button -->
  <button
    data-associated-menu="updateRateMenu"
    id="update-rates-btn"
    aria-expanded="false"
    class="items-center hidden px-2 py-2 transition rounded-lg text-text bg-secondary dark:text-dark-text {classProp
      ? classProp
      : ''} dark:bg-dark-secondary hover:brightness-150 md:block"
  >
    <Icon data={refresh} data-associated-menu="updateRateMenu" class="scale-100 opacity-50" />
    {$updateRate / 1000}s
    <Icon data={chevronDown} data-associated-menu="updateRateMenu" class="scale-75 opacity-50" />
  </button>

  <!-- Update Menu -->
  <div
    tabindex="-1"
    id="updateRateMenu"
    aria-hidden="true"
    class="absolute right-0 z-50 hidden w-24 py-1 rounded-md top-12 h-fit bg-secondary dark:bg-dark-secondary"
  >
    <!-- Update Rate Buttons -->
    {#each UPDATE_RATES as rate}
      <button
        on:click={() => updateRate.set(rate)}
        class="flex items-center w-full h-8 px-2 text-text dark:text-dark-text bg-secondary dark:bg-dark-secondary hover:bg-accent/30 dark:hover:bg-dark-accent/30 {rate ===
        $updateRate
          ? '!bg-accent !dark:bg-dark-accent'
          : ''}"
      >
        {rate / 1000}s
      </button>
    {/each}
  </div>
</div>
