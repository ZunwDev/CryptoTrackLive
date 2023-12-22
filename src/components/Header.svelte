<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "svelte-awesome";
  import { chevronDown, moonO, sunO, refresh, bars, search } from "svelte-awesome/icons";
  import { currencyStore, updateRate } from "../store/store";
  import { writable } from "svelte/store";
  import { handleClickOutside, toggleMenu } from "../util/utils";
  import type { CryptoData, NoCoinsFound } from "../types/Data";
  import { CURRENCIES, MAIN_PAGE_URL, SORT_DIRECTION_ASCENDING, UPDATE_RATES } from "../util/constants";
  import { getData } from "../util/api";

  let currentCurrency: string = $currencyStore;
  let currentRate: number = $updateRate;

  async function updateAllData() {
    await fetchData();
  }

  $: {
    currentCurrency = $currencyStore;
    currentRate = $updateRate;
    updateAllData();
  }

  let currencyMenu: HTMLElement | null;
  let currencyButton: HTMLElement | null;
  let updateRateMenu: HTMLElement | null;
  let updateRateButton: HTMLElement | null;
  let searchBarPCInput: HTMLInputElement | null;
  let searchBarPC: HTMLElement | null;
  let searchMenu: HTMLElement | null;
  let darkModeIconElement: HTMLElement | null;
  let tableData: CryptoData[] = [];
  let searchLoading: boolean = true;

  const darkMode = writable(false);
  function toggleDarkMode() {
    darkMode.update((mode) => {
      const isDark = document.documentElement.classList.toggle("dark", !mode);
      localStorage.setItem("color-theme", isDark ? "dark" : "");
      const iconToChange = darkModeIconElement?.firstChild as HTMLElement | null;
      iconToChange?.classList.toggle("rotate-45", !isDark);
      return !mode;
    });
  }

  async function fetchData() {
    try {
      searchLoading = true;
      const response = (await getData("USD", null, SORT_DIRECTION_ASCENDING, null)) as CryptoData[];
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
      searchLoading = false;
    }
  }

  const searchCryptocurrencies = async (searchTerm: string, limit = 10) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matches = tableData.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(searchTermLower) || crypto.code.toLowerCase().includes(searchTermLower)
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
  let currentSearchInput: string | undefined = "";

  const displaySearchResults = async (input: string | undefined) => {
    try {
      searchLoading = true;
      if (!storedSearchResults.length || currentSearchInput !== input) {
        storedSearchResults = await searchCryptocurrencies(input as string);
        currentSearchInput = input;
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      searchLoading = false;
    }
  };

  function updateData(
    newData: string | number,
    element1: HTMLElement | null,
    element2: HTMLElement | null,
    store: any
  ) {
    element1?.setAttribute("aria-hidden", "true");
    element2?.setAttribute("aria-expanded", "false");
    element1?.classList.toggle("hidden");
    store.set(newData);
  }

  onMount(() => {
    const storedMode = localStorage.getItem("color-theme");
    if (storedMode === "dark" || (!storedMode && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      toggleDarkMode();
    }

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
        setTimeout(() => {
          searchBarPCInput?.focus();
          searchMenu?.classList.toggle("hidden");
          searchLoading = true;
          displaySearchResults(searchBarPCInput?.value);
        }, 0);
      }
    });
  });
  let timer: number;
  $: {
    if (searchBarPCInput) {
      searchBarPCInput.addEventListener("keyup", (event) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          searchLoading = true;
          displaySearchResults(searchBarPCInput?.value);
        }, 1000);
      });
    }
  }

  const toggleSearchMenu = () => {
    if (searchMenu) {
      searchMenu.classList.toggle("hidden");
      if (!searchMenu.classList.contains("hidden")) {
        searchLoading = true;
        displaySearchResults(searchBarPCInput?.value);
      }
    }
  };
</script>

<header class="w-full border-b border-b-secondary dark:border-b-dark-secondary">
  <nav class="flex px-4 py-3 my-auto mx-auto transition-all justify-between items-center w-full min-w-[320px]">
    <a href={MAIN_PAGE_URL} class="relative flex items-center w-40 mr-auto sm:mr-0">
      <span class="relative z-10 text-xl font-semibold tracking-wide text-text dark:text-dark-text">Crypto</span>
      <span class="relative z-10 text-xl font-semibold tracking-wide text-accent dark:text-dark-accent">Track</span>
      <span
        class="absolute top-0 right-0 px-1 text-xs rounded-md text-text bg-primary dark:text-dark-text dark:bg-dark-primary"
        >LIVE</span
      >
    </a>

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
          {#if searchLoading}
            <div class="flex items-center justify-center w-full h-full">
              <div class="lds-ring">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          {:else}
            {#each storedSearchResults as result}
              {#if result.png64}
                <a
                  role="button"
                  on:click={() => searchMenu?.classList.toggle("hidden")}
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
          {/if}
        </div>
      </div>
      <!-- Search Bar Phone -->
      <button
        class="relative flex items-center justify-center w-10 h-10 overflow-hidden transition rounded-lg md:hidden text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150"
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
          {currentCurrency}
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
              currentCurrency
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
          {currentRate / 1000}s
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
              currentRate
                ? '!bg-accent !dark:bg-dark-accent'
                : ''}"
            >
              {rate / 1000}s
            </button>
          {/each}
        </div>
      </div>

      <!-- Dark Mode Toggle -->
      <button
        bind:this={darkModeIconElement}
        on:click={toggleDarkMode}
        class="relative items-center hidden w-10 h-10 overflow-hidden transition rounded-lg text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150 md:block"
      >
        <span class="absolute inset-0 flex items-center justify-center transition-all duration-400">
          {#if $darkMode}
            <Icon data={moonO}></Icon>
          {:else}
            <Icon data={sunO}></Icon>
          {/if}
        </span>
      </button>

      <!-- Burger Menu (Mobile) -->
      <button
        id="burger-menu"
        class="relative items-center block w-10 h-10 overflow-hidden transition rounded-lg md:hidden text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150"
      >
        <span class="inset-0 flex items-center justify-center transition-all">
          <Icon data={bars}></Icon>
        </span>
      </button>
    </div>
  </nav>
</header>
