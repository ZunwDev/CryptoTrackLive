<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "svelte-awesome";
  import { chevronDown, refresh, bars, search, remove } from "svelte-awesome/icons";
  import { currencyStore, dataLoading, isSearchBarPhoneHidden, updateRate } from "@store/store";
  import type { CryptoData, NoCoinsFound } from "../../types/Data";
  import { getData } from "@util/api/api";
  import { CURRENCIES, UPDATE_RATES } from "@util/constants";
  import { Loading } from "@components/util";
  import { browser } from "$app/environment";
  import { DarkModeButton, Logo, ShowSearchData } from "@components/global";
  import { toggleMenu, handleClickOutside } from "@util/uiUtils";
  import { focusElement } from "@util/uiUtils";

  async function handleStoreChanges() {
    await fetchData();
  }

  currencyStore.subscribe(handleStoreChanges);
  updateRate.subscribe(handleStoreChanges);

  let currencyMenu: HTMLElement;
  let currencyButton: HTMLElement;
  let updateRateMenu: HTMLElement;
  let updateRateButton: HTMLElement;
  let searchBarPCInput: HTMLInputElement;
  let searchBarPC: HTMLElement;
  let searchBarInputPhone: HTMLInputElement;
  let searchBarPhone: HTMLElement;
  let searchMenuPhone: HTMLElement;
  let searchMenu: HTMLElement;
  let tableData: CryptoData[] = [];

  async function fetchData() {
    try {
      const response = (await getData(100)) as CryptoData[];
      if (response) {
        // @ts-ignore
        tableData = response.map((crypto) => ({
          rank: crypto.rank || 0,
          name: crypto.name || "-",
          code: crypto.code || "-",
          png64: crypto.png64 || "-",
        }));
      } else {
        tableData = [];
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
    }
  }

  const searchCryptocurrencies = async (searchTerm: string, limit = 10) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matches = tableData.filter(
      (crypto) => crypto.name.toLowerCase().includes(searchTermLower) || crypto.code.toLowerCase().includes(searchTermLower)
    );

    if (searchTerm === "") {
      return matches.slice(0, limit);
    }

    if (matches.length > 0) {
      matches.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        const indexA = nameA.indexOf(searchTermLower);
        const indexB = nameB.indexOf(searchTermLower);
        if (indexA !== indexB) {
          return indexA - indexB;
        }
        return nameA.length - nameB.length;
      });

      return matches.slice(0, limit);
    } else {
      const noCoinsFound: NoCoinsFound = { name: "No coins found.", code: "", png64: "", rank: null };
      return [noCoinsFound];
    }
  };

  let storedSearchResults: (CryptoData | NoCoinsFound)[] = [];
  let currentSearchInput: string;

  const displaySearchResults = async (input: string) => {
    try {
      if (!storedSearchResults.length || currentSearchInput !== input) {
        storedSearchResults = await searchCryptocurrencies(input);
        currentSearchInput = input;
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
    }
  };

  function updateData(newData: string | number, element1: HTMLElement | null, element2: HTMLElement | null, store: any) {
    element1?.setAttribute("aria-hidden", "true");
    element2?.setAttribute("aria-expanded", "false");
    element1?.classList.toggle("hidden");
    store.set(newData);
  }

  onMount(() => {
    if (browser) {
      window.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;
        if (target === updateRateButton || (updateRateButton && updateRateButton.contains(target))) {
          event.stopPropagation();
          toggleMenu(updateRateMenu, updateRateButton, currencyMenu);
        } else if (target === currencyButton || (currencyButton && currencyButton.contains(target))) {
          event.stopPropagation();
          toggleMenu(currencyMenu, currencyButton, updateRateMenu);
        } else if (target === searchBarPC || (searchBarPC && searchBarPC.contains(target))) {
          event.stopPropagation();
        } else {
          handleClickOutside(event, currencyMenu, currencyButton);
          handleClickOutside(event, updateRateMenu, updateRateButton);
          handleClickOutside(event, searchMenu, searchBarPC);
        }
      });

      window.addEventListener("keyup", (event) => {
        if (event.key === "/") {
          focusElement(searchBarPCInput);
          searchMenu?.classList.toggle("hidden");
          displaySearchResults(searchBarPCInput?.value);
        }
      });
    }
  });

  function debounce<F extends (...args: any[]) => void>(func: F, delay: number): (...args: Parameters<F>) => void {
    let timer: ReturnType<typeof setTimeout>;
    return function (this: any, ...args: Parameters<F>) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  const debouncedSearchResults = debounce((value: string) => {
    displaySearchResults(value);
  }, 200);

  $: {
    // For PC input
    if (searchBarPCInput) {
      searchBarPCInput.addEventListener("keyup", () => {
        debouncedSearchResults(searchBarPCInput.value);
      });
    }

    // For phone input
    if (searchBarInputPhone) {
      searchBarInputPhone.addEventListener("keyup", () => {
        debouncedSearchResults(searchBarInputPhone.value);
      });
    }
  }

  const toggleSearchMenu = () => {
    if (searchMenu) {
      searchMenu.classList.toggle("hidden");
      if (!searchMenu.classList.contains("hidden")) {
        displaySearchResults(searchBarPCInput?.value);
      }
    }
  };

  function removeTextFromSearchBar() {
    searchBarInputPhone.value = "";
    focusElement(searchBarInputPhone);
    displaySearchResults(searchBarInputPhone.value);
  }

  function toggleSearchPhone() {
    focusElement(searchBarInputPhone);
    searchBarPhone.classList.toggle("hidden");
    searchMenuPhone.classList.toggle("hidden");
    isSearchBarPhoneHidden.set(!$isSearchBarPhoneHidden);
    displaySearchResults(searchBarInputPhone.value);
  }
</script>

<header class="w-full border-b border-b-secondary dark:border-b-dark-secondary">
  <div
    bind:this={searchBarPhone}
    class="absolute flex items-center justify-between hidden w-full h-16 gap-2 px-2 bg-secondary dark:bg-dark-secondary min-w-[320px] text-text dark:text-dark-text"
  >
    <Icon data={search} class="absolute inset-0 z-30 opacity-50 left-3 top-6"></Icon>
    <input
      bind:this={searchBarInputPhone}
      type="text"
      placeholder="Search coins..."
      class="inset-0 flex w-full h-full pl-8 pr-6 text-left border-none outline-none bg-secondary text-text dark:text-dark-text dark:bg-dark-secondary focus:outline-none"
    />
    <div class="flex items-center justify-end gap-1">
      <button
        on:click={removeTextFromSearchBar}
        class="flex items-center justify-center w-8 h-8 rounded-lg bg-text/10 dark:bg-dark-text/10 text-text dark:text-dark-text hover:bg-text/20 hover:dark:bg-dark-text/20"
        ><Icon data={remove} /></button
      >
      <button
        on:click={toggleSearchPhone}
        class="flex px-2 py-1 rounded-lg bg-text/10 dark:bg-dark-text/10 text-text dark:text-dark-text hover:bg-text/20 hover:dark:bg-dark-text/20"
        >Cancel</button
      >
      <div
        bind:this={searchMenuPhone}
        tabindex="-1"
        aria-hidden="true"
        class="absolute right-0 z-50 hidden w-full py-1 overflow-y-auto border-t rounded-bl-md rounded-br-md h-96 top-16 bg-secondary dark:bg-dark-secondary border-text/20 dark:border-dark-text/20"
      >
        <ShowSearchData {storedSearchResults} {searchMenu} {searchMenuPhone} {searchBarPhone} />
      </div>
    </div>
  </div>
  <nav class="flex px-4 py-3 my-auto mx-auto transition-all justify-between items-center w-full min-w-[320px]">
    <Logo />

    <div class="flex gap-0.5 md:gap-2 ml-auto md:ml-0">
      <!-- Search Bar PC -->
      <div
        bind:this={searchBarPC}
        aria-expanded="false"
        class="relative hidden px-32 py-2 mx-auto transition-all rounded-lg md:block bg-secondary dark:bg-dark-secondary text-text dark:text-dark-text"
      >
        <Icon data={search} class="absolute inset-0 z-30 scale-125 opacity-50 left-2 top-3"></Icon>
        <input
          on:click={() => toggleSearchMenu()}
          bind:this={searchBarPCInput}
          type="text"
          placeholder="Search coins..."
          class="absolute inset-0 w-full h-full pl-8 pr-6 text-left border-none rounded-lg outline-none bg-secondary focus:bg-bg/50 dark:focus:bg-dark-bg/50 dark:bg-dark-secondary focus:outline-none"
        />
        <span
          class="absolute z-30 py-0.5 px-1.5 right-1.5 bottom-1.5 bg-secondary dark:bg-dark-secondary brightness-200 rounded-lg opacity-50 text-text dark:text-dark-text"
          >/</span
        >
        <div
          bind:this={searchMenu}
          tabindex="-1"
          aria-hidden="true"
          class="absolute right-0 z-50 hidden w-64 py-1 overflow-y-auto rounded-md h-72 top-12 bg-secondary dark:bg-dark-secondary"
        >
          {#if $dataLoading.isLoading}
            <div class="flex items-center justify-center w-full h-full">
              <Loading />
            </div>
          {:else}
            <ShowSearchData {storedSearchResults} {searchMenu} {searchMenuPhone} {searchBarPhone} />
          {/if}
        </div>
      </div>
      <!-- Search Bar Phone -->
      <button
        on:click={toggleSearchPhone}
        class="relative {!$isSearchBarPhoneHidden
          ? 'hidden'
          : ''} flex items-center justify-center w-10 h-10 overflow-hidden transition rounded-lg md:hidden text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150"
      >
        <span class="flex items-center justify-center transition-all">
          <Icon data={search}></Icon>
        </span>
      </button>
      <span class="w-0.5 py-4 bg-secondary dark:bg-dark-secondary hidden md:block"></span>
      <div class="relative">
        <!-- Currency Selector -->
        <button
          bind:this={currencyButton}
          aria-expanded="false"
          class="items-center hidden px-2 py-2 transition rounded-lg text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150 md:block"
        >
          {$currencyStore}
          <Icon data={chevronDown} class="scale-75 opacity-50" />
        </button>
        <div
          bind:this={currencyMenu}
          tabindex="-1"
          aria-hidden="true"
          class="absolute right-0 z-50 hidden w-32 py-1 rounded-md top-12 h-fit bg-secondary dark:bg-dark-secondary"
        >
          <!-- Currency Buttons -->
          {#each CURRENCIES as currencyItem}
            {#if currencyItem === "BTC (₿)"}
              <span class="block w-full h-0.5 px-1 bg-primary dark:bg-dark-primary"></span>
            {/if}
            <button
              on:click={() => updateData(currencyItem, currencyMenu, currencyButton, currencyStore)}
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

      <div class="relative">
        <!-- Update Button -->
        <button
          bind:this={updateRateButton}
          class="items-center hidden px-2 py-2 transition rounded-lg text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150 md:block"
        >
          <Icon data={refresh} class="scale-100 opacity-50" />
          {$updateRate / 1000}s
          <Icon data={chevronDown} class="scale-75 opacity-50" />
        </button>

        <!-- Update Menu -->
        <div
          bind:this={updateRateMenu}
          tabindex="-1"
          aria-hidden="true"
          class="absolute right-0 z-50 hidden w-24 py-1 rounded-md top-12 h-fit bg-secondary dark:bg-dark-secondary"
        >
          <!-- Update Rate Buttons -->
          {#each UPDATE_RATES as rate}
            <button
              on:click={() => updateData(rate, updateRateMenu, updateRateButton, updateRate)}
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

      <!-- Dark Mode Toggle -->
      <DarkModeButton />

      <!-- Burger Menu (Mobile) -->
      <button
        id="burger-menu"
        class="relative {!$isSearchBarPhoneHidden
          ? 'hidden'
          : ''} items-center block w-10 h-10 overflow-hidden transition rounded-lg md:hidden text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150"
      >
        <span class="inset-0 flex items-center justify-center transition-all">
          <Icon data={bars}></Icon>
        </span>
      </button>
    </div>
  </nav>
</header>
