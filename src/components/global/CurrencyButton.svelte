<script lang="ts">
  import { currencyStore } from "@store/store";
  import { CURRENCIES } from "@util/constants";
  import { Icon } from "svelte-awesome";
  import { chevronDown } from "svelte-awesome/icons";

  export let classProp: string = "";
</script>

<div class="relative">
  <!-- Currency Selector -->
  <button
    aria-expanded="false"
    id="currency-btn"
    data-associated-menu="currencyMenu"
    class="items-center hidden px-2 py-2 transition rounded-lg text-text bg-secondary dark:text-dark-text {classProp
      ? classProp
      : ''} dark:bg-dark-secondary hover:brightness-150 md:block"
  >
    {$currencyStore}
    <Icon data={chevronDown} data-associated-menu="currencyMenu" class="scale-75 opacity-50" />
  </button>
  <div
    tabindex="-1"
    id="currencyMenu"
    aria-hidden="true"
    class="absolute right-0 z-50 hidden w-32 py-1 rounded-md top-12 h-fit bg-secondary dark:bg-dark-secondary"
  >
    <!-- Currency Buttons -->
    {#each CURRENCIES as currencyItem}
      {#if currencyItem === "BTC (₿)"}
        <span class="block w-full h-0.5 px-1 bg-primary dark:bg-dark-primary"></span>
      {/if}
      <button
        on:click={() => currencyStore.set(currencyItem)}
        class="flex items-center w-full h-8 px-2 text-text dark:text-dark-text bg-secondary dark:bg-dark-secondary hover:bg-accent/30 dark:hover:bg-dark-accent/30 {currencyItem ==
        $currencyStore
          ? '!bg-accent !dark:bg-dark-accent'
          : ''}"
      >
        {currencyItem}
      </button>
    {/each}
  </div>
</div>
