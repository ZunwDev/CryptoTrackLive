<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "svelte-awesome";
  import ChevronDown from "svelte-awesome/icons/chevronDown";
  import angleDoubleUp from "svelte-awesome/icons/angleDoubleUp";
  import folderOpenO from "svelte-awesome/icons/folderOpenO";
  import sortAsc from "svelte-awesome/icons/sortAsc";
  import sortDesc from "svelte-awesome/icons/sortDesc";
  import sort from "svelte-awesome/icons/sort";
  import Data from "./Data.svelte";
  import { entryStore, sortDirStore, sortByStore } from "./store";
  import { handleClickOutside, scrollToBottom, scrollToTop, toggleMenu } from "../util/utils";

  $: currentEntry = $entryStore;
  let entryButton: HTMLElement | null;
  let entryMenu: HTMLElement | null;

  let names: any[] = [
    { name: "#", sortable: true, sortBy: "rank", sortDir: "ascending" },
    { name: "Icon", sortable: false },
    { name: "Coin", sortable: true, sortBy: "name", sortDir: "" },
    { name: "Weekly", sortable: false },
    { name: "Price", sortable: true, sortBy: "price", sortDir: "" },
    { name: "1h", sortable: false },
    { name: "24h", sortable: false },
    { name: "Market Cap", sortable: false },
    { name: "Volume", sortable: true, sortBy: "volume", sortDir: "" },
    { name: "Supply", sortable: false },
    { name: "Max S.", sortable: false },
  ];
  let entries = [10, 25, 50, 75, 100];

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
    setTimeout(() => {
      scrollToBottom();
    }, 2000);
  }

  function sortCoins(sortBy?: string) {
    if (!sortBy) return;

    const selectedName = names.find((item) => item.sortBy === sortBy);
    const allSortable = names.filter((item) => item.sortDir !== undefined);

    if (selectedName) {
      const currentDir = selectedName.sortDir === "ascending" ? "descending" : "ascending";

      allSortable.forEach((element) => {
        element.sortDir = "";
      });

      sortDirStore.set(currentDir);

      const updatedNames = names.map((item) => {
        if (item.sortBy === sortBy) {
          return { ...item, sortDir: currentDir };
        }
        return item;
      });

      names = updatedNames;
      sortByStore.set(sortBy);
    }
  }

  onMount(() => {
    document.body.classList.add("bg-bg", "dark:bg-dark-bg");
    entryButton = document.getElementById("entries-button");
    entryMenu = document.getElementById("entries-menu");

    window.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (target === entryButton || (entryButton && entryButton.contains(target))) {
        event.stopPropagation();
        toggleMenu(entryMenu, entryButton, entryMenu);
      } else {
        handleClickOutside(event, entryMenu, entryButton);
      }
    });
  });
</script>

<svelte:head>
  <title>Home</title>
  <meta name="description" content="Track crypto market live" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet" />
</svelte:head>

<section class="flex items-center justify-center w-full py-8">
  <h2 class="text-2xl text-text dark:text-dark-text min-w-[360px]">Cryptocurrency Prices Live</h2>
</section>

<section class="flex items-center justify-center w-full">
  <div class="flex flex-col pb-48 overflow-auto">
    <!-- Table container with potential overflow -->
    <div class="relative overflow-auto">
      <table class="border border-secondary dark:border-dark-secondary">
        <thead>
          <!-- Table header with dynamically generated columns -->
          <tr class="even:bg-secondary odd:bg-bg dark:even:bg-dark-secondary dark:odd:bg-dark-bg">
            {#each names as name}
              <!-- Table header columns -->
              <th
                class="px-4 py-2 text-text dark:text-dark-text {name.sortable ? 'cursor-pointer' : ''}"
                on:click={() => {
                  if (name.sortable) sortCoins(name.sortBy);
                }}
              >
                {name.name}
                {#if name.sortable && name.sortDir === "ascending"}
                  <Icon data={sortAsc} class="opacity-50 text-accent"></Icon>
                {/if}
                {#if name.sortable && name.sortDir === "descending"}
                  <Icon data={sortDesc} class="opacity-50 text-accent"></Icon>
                {/if}
                {#if name.sortable && name.sortDir == ""}
                  <Icon data={sort} class="opacity-50 text-accent"></Icon>
                {/if}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          <!-- Component or data rendering for table body -->
          <Data />
        </tbody>
      </table>
    </div>
    <!-- Entries Selector -->
    <div class="flex flex-row {currentEntry > 10 ? 'justify-between' : 'justify-end'} py-4">
      <!-- Go up button (conditionally rendered) -->
      {#if currentEntry > 10}
        <button
          on:click={() => scrollToTop()}
          class="flex items-center px-4 py-2 transition rounded-lg text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150"
        >
          <Icon data={angleDoubleUp} class="scale-125 opacity-50" />
        </button>
      {/if}

      <!-- Entries Button (always on the right) -->
      <div class="relative">
        <button
          id="entries-button"
          aria-expanded="false"
          class="flex items-center px-2 py-2 transition rounded-lg text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150 xs:hidden sm:hidden md:block 2xl:block"
        >
          <Icon data={folderOpenO} class="opacity-50" />
          {currentEntry} Coins
          <Icon data={ChevronDown} class="scale-75 opacity-50" />
        </button>

        <!-- Dropdown menu for entries -->
        <div
          id="entries-menu"
          tabindex="-1"
          aria-hidden="true"
          class="absolute right-0 z-50 hidden w-32 py-1 mt-2 rounded-md top-12 bg-secondary dark:bg-dark-secondary"
        >
          <!-- Entry selection buttons -->
          {#each entries as entryItem}
            <button
              on:click={() => updateData(entryItem, entryMenu, entryButton, entryStore)}
              class="flex items-center w-full h-8 px-2 text-text dark:text-dark-text bg-secondary dark:bg-dark-secondary hover:bg-accent/30 dark:hover:bg-dark-accent/30 {entryItem ===
              currentEntry
                ? '!bg-accent !dark:bg-dark-accent'
                : ''}"
            >
              {entryItem} Coins
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>
