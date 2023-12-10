<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "svelte-awesome";
  import { chevronDown, angleDoubleUp, folderOpenO, sortAsc, sortDesc, sort } from "svelte-awesome/icons";
  import Data from "../components/Data.svelte";
  import { entryStore, sortDirStore, sortByStore, dataLoading } from "../store/store";
  import { handleClickOutside, scrollToBottom, scrollToTop, toggleMenu } from "../util/utils";
  import { ENTRY_AMOUNT, SORT_DIRECTION_ASCENDING, SORT_DIRECTION_DESCENDING } from "../util/constants";

  let currentLoadingState: boolean = $dataLoading;
  let currentEntry: number = $entryStore;
  let entryButton: HTMLElement | null;
  let entryMenu: HTMLElement | null;

  $: {
    currentEntry = $entryStore;
    currentLoadingState = $dataLoading;
  }

  let names: { name: string; sortable: boolean; sortBy?: string; sortDir?: string; hiddenOnSmall?: boolean }[] = [
    { name: "#", sortable: true, sortBy: "rank", sortDir: "ascending" },
    { name: "Coin", sortable: true, sortBy: "name", sortDir: "" },
    { name: "Weekly", sortable: false, hiddenOnSmall: true },
    { name: "Price", sortable: true, sortBy: "price", sortDir: "" },
    { name: "1h", sortable: false },
    { name: "24h", sortable: false },
    { name: "Market Cap", sortable: false, hiddenOnSmall: true },
    { name: "Volume", sortable: true, sortBy: "volume", sortDir: "", hiddenOnSmall: true },
    { name: "Supply", sortable: false, hiddenOnSmall: true },
    { name: "Max S.", sortable: false, hiddenOnSmall: true },
  ];

  function updateData(newData: number, element1: HTMLElement | null, element2: HTMLElement | null, store: any) {
    element1?.setAttribute("aria-hidden", "true");
    element2?.setAttribute("aria-expanded", "false");
    element1?.classList.toggle("hidden");
    store.set(newData);
    if (newData > 10) {
      setTimeout(() => {
        scrollToBottom();
      }, 3000);
    } else {
      setTimeout(() => {
        scrollToTop();
      }, 1000);
    }
  }

  function sortCoins(sortBy?: string) {
    if (!sortBy) return;

    const selectedName = names.find((item) => item.sortBy === sortBy);
    const allSortable = names.filter((item) => item.sortDir !== undefined);

    if (selectedName) {
      const currentDir =
        selectedName.sortDir === SORT_DIRECTION_ASCENDING ? SORT_DIRECTION_DESCENDING : SORT_DIRECTION_ASCENDING;

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

  function handleWindowClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target === entryButton || (entryButton && entryButton.contains(target))) {
      event.stopPropagation();
      toggleMenu(entryMenu, entryButton, entryMenu);
    } else {
      handleClickOutside(event, entryMenu, entryButton);
    }
  }

  onMount(() => {
    window.addEventListener("click", handleWindowClick);
  });
</script>

<svelte:head>
  <title>Home</title>
  <meta charset="UTF-8" />
  <meta name="description" content="App for crypto tracking" />
  <meta name="author" content="ZunwDev" />
  <meta name="keywords" content="HTML, CSS, JavaScript, Svelte" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet" />
</svelte:head>

<section class="flex items-center justify-center w-full py-8 min-w-[320px]">
  <h2 class="2xl:text-2xl sm:text-2xl xs:text-lg text-text dark:text-dark-text">Cryptocurrency Prices Live</h2>
</section>

<section class="relative flex items-center justify-center w-full">
  {#if currentLoadingState}
    <div class="absolute">
      <div class="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  {/if}
  <div class="flex flex-col pb-48 overflow-auto">
    <!-- Table container with potential overflow -->
    <div class="overflow-x-auto">
      <table class="border table-auto border-secondary dark:border-dark-secondary">
        <thead>
          <!-- Table header with dynamically generated columns -->
          <tr class="even:bg-secondary odd:bg-bg dark:even:bg-dark-secondary dark:odd:bg-dark-bg">
            {#each names as name, index}
              <!-- Table header columns -->
              <th
                class="sm:px-4 2xl:px-4 py-2 xs:text-xs
                     {index === 0 ? 'px-2' : index < 2 ? 'xs:px-0.5' : index >= 4 ? 'px-2' : 'xs:px-8'} 
                     sm:text-base 2xl:text-base text-text dark:text-dark-text
                     {name.hiddenOnSmall ? 'hidden sm:table-cell 2xl:table-cell' : 'sm:table-cell 2xl:table-cell'} 
                     {name.sortable ? 'cursor-pointer' : ''}"
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
          bind:this={entryButton}
          id="entries-button"
          aria-expanded="false"
          class="flex items-center px-2 py-2 transition rounded-lg text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150 xs:hidden sm:hidden md:block 2xl:block"
        >
          <Icon data={folderOpenO} class="opacity-50" />
          {currentEntry} Coins
          <Icon data={chevronDown} class="scale-75 opacity-50" />
        </button>

        <!-- Dropdown menu for entries -->
        <div
          bind:this={entryMenu}
          id="entries-menu"
          tabindex="-1"
          aria-hidden="true"
          class="absolute right-0 z-50 hidden w-32 py-1 mt-2 rounded-md top-12 bg-secondary dark:bg-dark-secondary"
        >
          <!-- Entry selection buttons -->
          {#each ENTRY_AMOUNT as entryItem}
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
