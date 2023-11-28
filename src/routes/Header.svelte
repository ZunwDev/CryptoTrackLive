<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "svelte-awesome";
  import ChevronDown from "svelte-awesome/icons/chevronDown";
  import moonO from "svelte-awesome/icons/moonO";
  import sunO from "svelte-awesome/icons/sunO";
  import refresh from "svelte-awesome/icons/refresh";
  import { currencyStore, updateRate } from "./store";
  import { writable } from "svelte/store";

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

  function toggleMenu(menu: HTMLElement | null, button: HTMLElement | null, otherMenu: HTMLElement | null) {
    if (menu && button) {
      const isMenuHidden = menu.classList.contains("hidden");
      const isOtherMenuHidden = otherMenu ? otherMenu.classList.contains("hidden") : true;

      if (isMenuHidden && !isOtherMenuHidden) {
        otherMenu?.setAttribute("aria-hidden", "true");
        otherMenu?.classList.add("hidden");
      }

      menu.setAttribute("aria-hidden", isMenuHidden ? "false" : "true");
      button.setAttribute("aria-expanded", isMenuHidden ? "true" : "false");
      menu.classList.toggle("hidden");
    }
  }

  function handleClickOutside(event: MouseEvent, menu: HTMLElement | null, button: HTMLElement | null) {
    const target = event.target as HTMLElement;
    if (menu && button && !menu.contains(target) && target !== button && !target.classList.contains("Icon")) {
      menu.setAttribute("aria-hidden", "true");
      button.setAttribute("aria-expanded", "false");
      menu.classList.add("hidden");
    }
  }

  onMount(() => {
    const storedMode = localStorage.getItem("color-theme");
    if (storedMode === "dark" || (!storedMode && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      toggleDarkMode();
    }
    currencyMenu = document.getElementById("currency-menu");
    currencyButton = document.getElementById("currency-button");
    updateRateMenu = document.getElementById("update-menu");
    updateRateButton = document.getElementById("update-button");

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
  });
</script>

<header>
  <nav
    class="flex items-center justify-between w-full py-3 my-auto border-b lg:px-64 md:px-32 sm:pl-4 border-b-secondary dark:border-b-dark-secondary"
  >
    <a href="cryptotracklive.com" class="relative flex items-center w-40">
      <span class="relative z-10 text-xl font-semibold tracking-wide text-text dark:text-dark-text">CryptoTrack</span>
      <span
        class="absolute top-0 right-0 px-1 text-xs rounded-md text-text bg-primary dark:text-dark-text dark:bg-dark-primary"
        >LIVE</span
      >
    </a>
    <div class="flex gap-2">
      <button
        id="currency-button"
        aria-expanded="false"
        class="items-center px-2 py-2 transition rounded-lg text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150"
      >
        {currentCurrency}
        <Icon data={ChevronDown} class="scale-75 opacity-50" />
      </button>
      <div
        id="currency-menu"
        tabindex="-1"
        aria-hidden="true"
        class="absolute z-50 w-32 py-1 transform translate-x-10 rounded-md top-16 right-[395px] h-fit bg-secondary dark:bg-dark-secondary hidden"
      >
        {#each currencies as currencyItem}
          <button
            on:click={() => updateData(currencyItem, currencyMenu, currencyButton, currencyStore)}
            class="
          flex items-center w-full h-8 px-2 text-text dark:text-dark-text
          bg-secondary dark:bg-dark-secondary
          hover:bg-accent/50 dark:hover:bg-dark-accent/50
          {currencyItem == currentCurrency ? '!bg-accent !dark:bg-dark-accent' : ''}
        "
          >
            {currencyItem}
          </button>
        {/each}
      </div>
      <button
        id="update-button"
        class="items-center px-2 py-2 transition rounded-lg text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150"
      >
        <Icon data={refresh} class="scale-100 opacity-50" />
        {currentRate / 1000}s
        <Icon data={ChevronDown} class="scale-75 opacity-50" />
      </button>
      <div
        id="update-menu"
        tabindex="-1"
        aria-hidden="true"
        class="absolute z-50 w-24 py-1 transform translate-x-10 rounded-md top-16 right-[325px] h-fit bg-secondary dark:bg-dark-secondary hidden"
      >
        {#each updateRates as rate}
          <button
            on:click={() => updateData(rate, updateRateMenu, updateRateButton, updateRate)}
            class="
        flex items-center w-full h-8 px-2 text-text dark:text-dark-text
        bg-secondary dark:bg-dark-secondary
        hover:bg-accent/50 dark:hover:bg-dark-accent/50
        {rate === currentRate ? '!bg-accent !dark:bg-dark-accent' : ''}
      "
          >
            {rate / 1000}s
          </button>
        {/each}
      </div>
      <button
        id="mode-icon"
        on:click={toggleDarkMode}
        class="relative items-center w-10 h-10 overflow-hidden transition rounded-lg text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150"
      >
        <span class="absolute inset-0 flex items-center justify-center transition-all duration-400">
          {#if $darkMode}
            <Icon data={moonO} class="fill-secondary dark:fill-dark-secondary"></Icon>
          {:else}
            <Icon data={sunO} class="fill-text dark:fill-dark-text"></Icon>
          {/if}
        </span>
      </button>
    </div>
  </nav>
</header>
