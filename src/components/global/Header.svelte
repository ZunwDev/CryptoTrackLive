<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "svelte-awesome";
  import { bars, search, remove, arrowRight, github } from "svelte-awesome/icons";
  import { currencyStore, dataLoading, updateRate } from "@store/store";
  import type { CryptoData, NoCoinsFound } from "../../types/Data";
  import { getData } from "@util/api/api";
  import { Loading } from "@components/util";
  import { browser } from "$app/environment";
  import { DarkModeButton, Logo, ShowSearchData, CurrencyButton, UpdateRatesButton } from "@components/global";
  import { handleClickOutside, toggleHidden } from "@util/uiUtils";
  import { focusElement } from "@util/uiUtils";
  import { debounce } from "@util/globalUtils";
  import { writable } from "svelte/store";

  async function handleStoreChanges() {
    await fetchData();
  }

  currencyStore.subscribe(handleStoreChanges);
  updateRate.subscribe(handleStoreChanges);

  let darkModeButton: HTMLElement | null;
  let currencyButton: HTMLElement | null;
  let updateRatesButton: HTMLElement | null;

  let screenWidth = writable(0);
  let searchBarPCInput: HTMLInputElement;
  let searchBarInputPhone: HTMLInputElement;
  let searchBarPhone: HTMLElement;
  let searchMenuPhone: HTMLElement;
  let searchMenu: HTMLElement;
  let burgerMenu: HTMLElement;
  let tableData: CryptoData[] = [];

  if (browser) {
    screenWidth.set(window.innerWidth);
  }

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

  let lastOpenedMenu: any = null;

  function hideMenu(menu: HTMLElement, target: HTMLElement) {
    menu.classList.add("hidden");
    menu.setAttribute("aria-hidden", "true");
    if (target instanceof HTMLElement) {
      target.setAttribute("aria-expanded", "false");
    }
    lastOpenedMenu = null;
  }

  const handleResize = () => {
    screenWidth.set(window.innerWidth);
  };

  function showMenu(menus: any, buttons: any, menu: HTMLElement, target: HTMLElement) {
    menus.forEach(hideMenu);
    buttons.forEach((button: any) => button.setAttribute("aria-expanded", "false"));

    menu.classList.toggle("hidden");
    menu.setAttribute("aria-hidden", "false");
    target.setAttribute("aria-expanded", "true");
    if (target instanceof HTMLElement) {
      lastOpenedMenu = target;
    }
  }

  onMount(() => {
    if (browser) {
      window.addEventListener("resize", handleResize);
      darkModeButton = document.getElementById("dark-mode-btn");
      currencyButton = document.getElementById("currency-btn");
      updateRatesButton = document.getElementById("update-rates-btn");
      window.addEventListener("click", (event: any) => {
        let target = event.target as HTMLElement;
        event.stopPropagation();

        if (target.tagName === "path" || target.tagName === "INPUT") {
          target = target.parentElement as HTMLElement;
        }

        const buttons = Array.from(document.querySelectorAll("button[data-associated-menu]")) as HTMLElement[];
        const menus = buttons.map((button) => document.getElementById(button.dataset.associatedMenu as string) as HTMLElement);
        const associatedMenu = document.getElementById(target.dataset.associatedMenu as string);

        if ((lastOpenedMenu === target || lastOpenedMenu?.tagName === "svg") && associatedMenu) {
          hideMenu(associatedMenu, target);
        } else if (associatedMenu?.getAttribute("aria-hidden") && target !== event.currentTarget && associatedMenu) {
          showMenu(menus, buttons, associatedMenu, target);
        } else {
          handleClickOutside(menus, buttons);
          lastOpenedMenu = null;
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

  const debouncedSearchResults = debounce((value: string) => displaySearchResults(value), 200);

  $: {
    if (searchBarPCInput) {
      searchBarPCInput.addEventListener("keyup", () => debouncedSearchResults(searchBarPCInput.value));
    }

    if (searchBarInputPhone) {
      searchBarInputPhone.addEventListener("keyup", () => debouncedSearchResults(searchBarInputPhone.value));
    }
  }

  const toggleSearchMenu = () => {
    if (searchMenu) {
      const isVisible = !searchMenu.classList.toggle("hidden");
      if (isVisible) displaySearchResults(searchBarPCInput?.value);
    }
  };

  const removeTextFromSearchBar = () => {
    searchBarInputPhone.value = "";
    focusElement(searchBarInputPhone);
    displaySearchResults(searchBarInputPhone.value);
  };

  const toggleSearchPhone = () => {
    focusElement(searchBarInputPhone);
    toggleHidden([searchBarPhone, searchMenuPhone]);
    displaySearchResults(searchBarInputPhone.value);
  };

  const toggleBurgerMenu = () => {
    toggleHidden([burgerMenu, darkModeButton, currencyButton, updateRatesButton]);
  };
</script>

<header class="w-full border-b border-b-secondary dark:border-b-dark-secondary">
  <div
    bind:this={burgerMenu}
    class="fixed z-50 flex flex-col hidden md:hidden w-full h-full transition bg-secondary dark:bg-dark-secondary text-text dark:text-dark-text min-w-[320px]"
  >
    <div class="flex items-center justify-between w-full px-4 pt-2 pb-4 mt-2 border-b border-text/20 dark:border-dark-text/20">
      <div class="flex items-center justify-center w-full">
        <Logo />
      </div>
      <div class="flex items-center">
        <button
          on:click={toggleBurgerMenu}
          class="z-50 flex items-center justify-center w-8 h-8 rounded-lg bg-text/10 dark:bg-dark-text/10 text-text dark:text-dark-text hover:bg-text/20 hover:dark:bg-dark-text/20"
        >
          <Icon data={remove} />
        </button>
      </div>
    </div>
    <div class="flex flex-col">
      <div class="flex justify-between px-4 mt-12 text-xl transition hover:text-accent dark:hover:text-dark-accent">
        <a href="https://cryptotrack-live.vercel.app" class="w-full">Coins</a>
        <a href="https://cryptotrack-live.vercel.app"><Icon data={arrowRight} class="scale-125" /></a>
      </div>
    </div>
    {#if $screenWidth <= 768}
      <div class="flex flex-wrap justify-center w-full gap-1 px-2 py-4 mt-8 border-t border-text/20 dark:border-dark-text/20">
        <CurrencyButton classProp={"bg-text/10 dark:bg-dark-text/10 hover:bg-text/30 dark:hover:bg-dark-text/20"} />
        <UpdateRatesButton classProp={"bg-text/10 dark:bg-dark-text/10 hover:bg-text/30 dark:hover:bg-dark-text/20"} />
        <DarkModeButton classProp={"bg-text/10 dark:bg-dark-text/10 hover:bg-text/30 dark:hover:bg-dark-text/20"} />
      </div>
    {/if}
    <div class="flex flex-wrap justify-center w-full mt-4">
      <a
        href="https://github.com/ZunwDev"
        target="_blank"
        class="text-text dark:text-dark-text hover:text-text/20 dark:hover:text-dark-text/20"
      >
        <Icon data={github} class="w-8 h-8"></Icon>
      </a>
    </div>
  </div>
  <div
    bind:this={searchBarPhone}
    class="fixed flex items-center justify-between z-50 hidden md:hidden w-full h-16 gap-2 px-2 bg-secondary dark:bg-dark-secondary min-w-[320px] text-text dark:text-dark-text"
  >
    <Icon data={search} class="absolute inset-0 opacity-50 z-[51] left-3 top-6" />
    <input
      bind:this={searchBarInputPhone}
      type="text"
      placeholder="Search coins..."
      class="inset-0 z-50 flex w-full h-full pl-8 pr-6 text-left border-none outline-none bg-secondary text-text dark:text-dark-text dark:bg-dark-secondary focus:outline-none"
    />
    <div class="flex items-center justify-end gap-1">
      <button
        on:click={removeTextFromSearchBar}
        class="z-50 flex items-center justify-center w-6 h-6 rounded-lg bg-text/10 dark:bg-dark-text/10 text-text dark:text-dark-text hover:bg-text/20 hover:dark:bg-dark-text/20"
        ><Icon data={remove} /></button
      >
      <button
        on:click={toggleSearchPhone}
        class="z-50 flex px-2 py-1 rounded-lg bg-text/10 dark:bg-dark-text/10 text-text dark:text-dark-text hover:bg-text/20 hover:dark:bg-dark-text/20"
        >Cancel</button
      >
      <div
        bind:this={searchMenuPhone}
        tabindex="-1"
        aria-hidden="true"
        class="fixed right-0 z-50 hidden w-full h-full py-2 overflow-y-auto border-t top-16 bg-secondary dark:bg-dark-secondary border-text/20 dark:border-dark-text/20"
      >
        <ShowSearchData {storedSearchResults} {searchMenu} {searchMenuPhone} {searchBarPhone} />
      </div>
    </div>
  </div>
  <nav class="flex px-4 py-3 my-auto mx-auto transition-all justify-between items-center w-full min-w-[320px]">
    <Logo />

    <div class="flex gap-0.5 md:gap-2 ml-auto md:ml-0">
      <!-- Search Bar PC -->
      <button
        aria-expanded="false"
        data-associated-menu="searchMenu"
        class="relative hidden px-32 py-2 mx-auto transition-all rounded-lg md:block bg-secondary dark:bg-dark-secondary text-text dark:text-dark-text"
      >
        <Icon data={search} data-associated-menu="searchMenu" class="absolute inset-0 z-30 scale-125 opacity-50 left-2 top-3"
        ></Icon>
        <input
          on:click={() => toggleSearchMenu()}
          bind:this={searchBarPCInput}
          type="text"
          data-associated-menu="searchMenu"
          placeholder="Search coins..."
          class="absolute inset-0 w-full h-full pl-8 pr-6 text-left border-none rounded-lg outline-none bg-secondary focus:bg-bg/50 dark:focus:bg-dark-bg/50 dark:bg-dark-secondary focus:outline-none"
        />
        <span
          data-associated-menu="searchMenu"
          class="absolute z-30 py-0.5 px-1.5 right-1.5 bottom-1.5 bg-secondary dark:bg-dark-secondary brightness-200 rounded-lg opacity-50 text-text dark:text-dark-text"
          >/</span
        >
        <div
          bind:this={searchMenu}
          tabindex="-1"
          id="searchMenu"
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
      </button>
      <!-- Search Bar Phone -->
      <button
        on:click={toggleSearchPhone}
        class="relative flex items-center justify-center w-10 h-10 overflow-hidden transition rounded-lg md:hidden text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150"
      >
        <span class="flex items-center justify-center transition-all">
          <Icon data={search}></Icon>
        </span>
      </button>
      <span class="w-0.5 py-4 bg-secondary dark:bg-dark-secondary hidden md:block"></span>

      <!-- Currency Convert -->
      <CurrencyButton classProp={""} />

      <!-- Update Rate Change -->
      <UpdateRatesButton classProp={""} />

      <!-- Dark Mode Toggle -->
      <DarkModeButton classProp={""} />

      <!-- Burger Menu (Mobile) -->
      <button
        on:click={toggleBurgerMenu}
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
