<script lang="ts">
  import { isSearchBarPhoneHidden, searchedTerm } from "@store/store";
  import type { CryptoData, NoCoinsFound } from "../../types/Data";

  export let storedSearchResults: (CryptoData | NoCoinsFound)[] = [];
  export let searchMenu: HTMLElement;
  export let searchMenuPhone: HTMLElement;
  export let searchBarPhone: HTMLElement;

  function setSearchData(code: string) {
    if (!searchMenu?.classList.contains("hidden")) {
      searchMenu?.classList.toggle("hidden");
    } else {
      searchMenuPhone.classList.toggle("hidden");
      searchBarPhone.classList.toggle("hidden");
      isSearchBarPhoneHidden.set(!$isSearchBarPhoneHidden);
    }
    searchedTerm.set(code);
  }
</script>

{#each storedSearchResults as result}
  {#if result.png64}
    <a
      role="button"
      on:click={() => setSearchData(result.code)}
      href={`/detail/${result.rank}/${result.code}`}
      class="flex items-center w-full h-12 px-4 text-left hover:bg-accent/30 dark:hover:bg-dark-accent/30"
    >
      <div class="flex flex-row items-center gap-2">
        <img src={result.png64} alt={result.code} loading="lazy" class="w-6 h-6 mr-2" />
        <span class="truncate text-text dark:text-dark-text">{result.name}</span>
        <span class="text-xs text-text/30 dark:text-dark-text/30">{result.code}</span>
      </div>
    </a>
  {:else}
    <div class="flex flex-row items-center justify-center h-full gap-2">
      <span class="truncate text-text dark:text-dark-text">{result.name}</span>
      <span class="text-xs text-text/30 dark:text-dark-text/30">{result.code}</span>
    </div>
  {/if}
{/each}
