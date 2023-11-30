<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "svelte-awesome";
  import ChevronDown from "svelte-awesome/icons/chevronDown";
  import moonO from "svelte-awesome/icons/moonO";
  import sunO from "svelte-awesome/icons/sunO";
  import refresh from "svelte-awesome/icons/refresh";
  import bars from "svelte-awesome/icons/bars";
  import search from "svelte-awesome/icons/search";
  import { currencyStore, updateRate } from "./store";
  import { writable } from "svelte/store";
  import { handleClickOutside, toggleMenu } from "../util/utils";

  $: currentCurrency = $currencyStore;
  $: currentRate = $updateRate;

  const darkMode = writable(false);
  function toggleDarkMode() {
    darkMode.update((mode) => {
      const newMode = !mode;
      const isDark = document.documentElement.classList.toggle("dark", newMode);

      localStorage.setItem("color-theme", isDark ? "dark" : "");
      const iconElement = document.getElementById("mode-icon");
      const iconToChange = iconElement?.firstChild as HTMLElement | null;
      iconToChange?.classList.toggle("rotate-45", !isDark);

      return newMode;
    });
  }

  let currencyMenu: HTMLElement | null;
  let currencyButton: HTMLElement | null;
  let updateRateMenu: HTMLElement | null;
  let updateRateButton: HTMLElement | null;
  let searchBarPC: HTMLElement | null;
  let currencies: any[] = ["USD ($)", "EUR (€)", "GBP (£)", "AUD ($)", "CAD ($)", "BTC (₿)", "ETH (Ξ)"];
  let updateRates: any[] = [5000, 10000, 15000, 20000, 25000, 30000];

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
      } else {
        handleClickOutside(event, currencyMenu, currencyButton);
        handleClickOutside(event, updateRateMenu, updateRateButton);
      }
    });

    window.addEventListener("keyup", (event) => {
      if (event.key === "/") {
        setTimeout(() => {
          searchBarPC?.focus();
        }, 0);
      }
    });
  });
</script>

<header class="w-full border-b border-b-secondary dark:border-b-dark-secondary">
  <nav class="flex px-4 py-3 my-auto mx-auto transition-all justify-between items-center w-full min-w-[320px]">
    <a href="cryptotracklive.com" class="relative flex items-center w-40 mr-auto sm:mr-0 2xl:mr-0">
      <span class="relative z-10 text-xl font-semibold tracking-wide text-text dark:text-dark-text">Crypto</span>
      <span class="relative z-10 text-xl font-semibold tracking-wide text-accent dark:text-dark-accent">Track</span>
      <span
        class="absolute top-0 right-0 px-1 text-xs rounded-md text-text bg-primary dark:text-dark-text dark:bg-dark-primary"
        >LIVE</span
      >
    </a>

    <div class="flex gap-0.5 md:gap-2 2xl:gap-2 ml-auto md:ml-0 2xl:ml-0">
      <!-- Search Bar PC -->
      <div
        class="relative hidden px-32 py-2 mx-auto transition-all rounded-lg md:block 2xl:block bg-secondary dark:bg-dark-secondary text-text dark:text-dark-text"
      >
        <Icon data={search} class="absolute inset-0 z-30 scale-125 opacity-50 left-2 top-3"></Icon>
        <input
          bind:this={searchBarPC}
          type="text"
          placeholder="Search coins..."
          class="absolute inset-0 w-full h-full pl-8 pr-6 text-left border-none rounded-lg outline-none bg-secondary focus:bg-bg/50 dark:focus:bg-dark-bg/50 dark:bg-dark-secondary focus:outline-none"
        />
        <span
          class="absolute z-30 py-0.5 px-1.5 right-1.5 bottom-1.5 bg-secondary dark:bg-dark-secondary brightness-200 rounded-lg opacity-50 text-text dark:text-dark-text"
          >/</span
        >
      </div>
      <!-- Search Bar Phone -->
      <button
        class="relative flex items-center justify-center w-10 h-10 overflow-hidden transition rounded-lg 2xl:hidden lg:hidden md:hidden xl:hidden text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150 xs:block sm:block"
      >
        <span class="flex items-center justify-center transition-all">
          <Icon data={search}></Icon>
        </span>
      </button>
      <span class="w-0.5 py-4 bg-secondary dark:bg-dark-secondary hidden md:block 2xl:block"></span>
      <div class="relative">
        <!-- Currency Selector -->
        <button
          bind:this={currencyButton}
          aria-expanded="false"
          class="items-center hidden px-2 py-2 transition rounded-lg text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150 md:block 2xl:block"
        >
          {currentCurrency}
          <Icon data={ChevronDown} class="scale-75 opacity-50" />
        </button>
        <div
          bind:this={currencyMenu}
          tabindex="-1"
          aria-hidden="true"
          class="absolute z-50 w-32 py-1 transform translate-x-10 rounded-md top-12 right-[5px] h-fit bg-secondary dark:bg-dark-secondary hidden"
        >
          <!-- Currency Buttons -->
          {#each currencies as currencyItem}
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
          class="items-center hidden px-2 py-2 transition rounded-lg text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150 md:block 2xl:block"
        >
          <Icon data={refresh} class="scale-100 opacity-50" />
          {currentRate / 1000}s
          <Icon data={ChevronDown} class="scale-75 opacity-50" />
        </button>

        <!-- Update Menu -->
        <div
          bind:this={updateRateMenu}
          tabindex="-1"
          aria-hidden="true"
          class="absolute z-50 w-24 py-1 transform translate-x-10 rounded-md top-12 right-[20px] h-fit bg-secondary dark:bg-dark-secondary hidden"
        >
          <!-- Update Rate Buttons -->
          {#each updateRates as rate}
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
        id="mode-icon"
        on:click={toggleDarkMode}
        class="relative items-center hidden w-10 h-10 overflow-hidden transition rounded-lg text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150 md:block 2xl:block"
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
        on:click={toggleDarkMode}
        class="relative items-center w-10 h-10 overflow-hidden transition rounded-lg 2xl:hidden lg:hidden md:hidden xl:hidden text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150 xs:block sm:block"
      >
        <span class="inset-0 flex items-center justify-center transition-all">
          <Icon data={bars}></Icon>
        </span>
      </button>
    </div>
  </nav>
</header>
