<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "svelte-awesome";
  import {
    chevronDown,
    angleDoubleUp,
    folderOpenO,
    sortAsc,
    sortDesc,
    sort,
    angleDoubleLeft,
    angleDoubleRight,
  } from "svelte-awesome/icons";
  import Data from "../components/Data.svelte";
  import { entryStore, sortDirStore, sortByStore, dataLoading, pageStore } from "../store/store";
  import { handleClickOutside, scrollToBottom, scrollToTop, toggleMenu } from "../util/utils";
  import { ENTRY_AMOUNT, SORT_DIRECTION_ASCENDING, SORT_DIRECTION_DESCENDING } from "../util/constants";
  import Overview from "../components/Overview.svelte";

  let currentLoadingState: boolean = $dataLoading;
  let currentEntry: number = $entryStore;
  let entryButton: HTMLElement | null;
  let entryMenu: HTMLElement | null;
  let currentPage: number = $pageStore;
  let pageCount: number = 100 / currentEntry;
  let sortedBy: string | undefined;
  let sortOrder: string | undefined;

  $: {
    currentEntry = $entryStore;
    currentLoadingState = $dataLoading;
    currentPage = $pageStore;
    pageCount = 100 / currentEntry;
    sortedBy = $sortByStore;
    sortOrder = $sortDirStore;
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
    pageStore.set(1);
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

  function generatePaginationLinks(currentPage: number, pageCount: number) {
    const linksToShow = 5;
    let startPage;
    if (currentPage > linksToShow - 1) {
      startPage = currentPage - linksToShow + 1;
    } else {
      startPage = 1;
    }
    const endPage = Math.min(startPage + linksToShow - 1, pageCount);
    const links = [];
    for (let i = startPage; i <= endPage; i++) {
      links.push(i);
    }
    return links;
  }

  function updatePage(page: number) {
    pageStore.set(page);
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

<section class="flex items-center justify-center w-full flex-col gap-2 py-8 min-w-[320px]">
  <h2 class="text-2xl text-text dark:text-dark-text">Cryptocurrency Prices Live</h2>
  <h4 class="text-text dark:text-dark-text">Sorted by {sortedBy?.toUpperCase()} - {sortOrder?.toUpperCase()}</h4>
</section>

<section class="flex flex-wrap items-center justify-center w-full gap-4 min-w-[320px] mb-4">
  <Overview />
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
      <table class="border table-auto border-secondary dark:border-dark-secondary min-w-[320px]">
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
    {#if !currentLoadingState}
      <div class="flex justify-between pt-4">
        <!-- Go up button -->
        <div class="relative">
          {#if currentEntry > 10}
            <button
              on:click={() => scrollToTop()}
              class="absolute left-0 inline-flex px-4 py-3 transition rounded-lg bottom-0.5 text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150"
            >
              <Icon data={angleDoubleUp} class="scale-125 opacity-50" />
            </button>
          {/if}
        </div>
        <!-- Pagination -->
        <div class="flex items-center justify-center mx-auto">
          <a
            role="button"
            on:click={() => (currentPage !== 1 ? updatePage(1) : undefined)}
            href={currentPage !== 1 ? "/?page=1" : undefined}
            class="px-3 py-2 rounded-tl-lg rounded-bl-lg border border-bg/50 dark:border-dark-bg/30 bg-secondary dark:bg-dark-secondary {currentPage ===
            1
              ? 'opacity-70 cursor-not-allowed'
              : 'hover:brightness-150 dark:hover:brigtness-200'}"
            ><Icon data={angleDoubleLeft} class="scale-100 opacity-50 text-text dark:text-dark-text"></Icon></a
          >
          {#if pageCount > 1}
            {#each generatePaginationLinks(currentPage, pageCount) as page}
              <a
                role="button"
                href="/?page={page}"
                on:click={() => (currentPage !== page ? updatePage(page) : undefined)}
                class="w-8 flex justify-center items-center py-2 text-text dark:text-dark-text border border-bg/50 dark:border-dark-bg/30 {currentPage ===
                page
                  ? 'bg-accent dark:bg-dark-accent hover:brightness-150 dark:hover:brigtness-200'
                  : 'hover:brightness-150 dark:hover:brigtness-200 bg-secondary dark:bg-dark-secondary'}">{page}</a
              >
            {/each}
          {/if}
          <a
            role="button"
            on:click={() => (currentPage !== pageCount ? updatePage(pageCount) : undefined)}
            href={currentPage !== pageCount ? `/?page=${pageCount}` : undefined}
            class="px-3 py-2 rounded-tr-lg rounded-br-lg border border-bg/50 dark:border-dark-bg/30 bg-secondary dark:bg-dark-secondary {currentPage ===
            pageCount
              ? 'opacity-70 cursor-not-allowed'
              : 'hover:brightness-150 dark:hover:brigtness-200'}"
            ><Icon data={angleDoubleRight} class="scale-100 opacity-50 text-text dark:text-dark-text"></Icon></a
          >
        </div>
      </div>
      <!-- Entries Button -->
      <div class="relative">
        <button
          bind:this={entryButton}
          id="entries-button"
          aria-expanded="false"
          class="absolute bottom-0.5 right-0 inline-flex px-2 py-2 transition rounded-lg text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150 xs:hidden sm:hidden md:block 2xl:block"
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
          class="absolute right-0 z-50 hidden w-32 py-1 rounded-md top-1 bg-secondary dark:bg-dark-secondary"
        >
          <!-- Entry selection buttons -->
          {#each ENTRY_AMOUNT as entryItem}
            <button
              on:click={() => updateData(entryItem, entryMenu, entryButton, entryStore)}
              class="inline-flex items-center w-full h-8 px-2 text-text dark:text-dark-text bg-secondary dark:bg-dark-secondary hover:bg-accent/30 dark:hover:bg-dark-accent/30 {entryItem ===
              currentEntry
                ? '!bg-accent !dark:bg-dark-accent'
                : ''}"
            >
              {entryItem} Coins
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</section>
