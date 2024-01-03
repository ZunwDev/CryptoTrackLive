<script lang="ts">
  import Icon from "svelte-awesome";
  import { angleDoubleUp, sortAsc, sortDesc, sort } from "svelte-awesome/icons";
  import { entryStore, sortDirStore, sortByStore, dataLoading, pageStore } from "@store/store";
  import { generatePaginationLinks, scrollToTop } from "@util/utils";
  import { SORT_DIRECTION_ASCENDING, SORT_DIRECTION_DESCENDING } from "@util/constants";
  import { Data, Overview } from "@components/home";
  import { Loading, EntryButton } from "@components/util";
  import { FirstPage, LastPage } from "@components/pagination";

  let pageCount: number = 100 / $entryStore;

  entryStore.subscribe((value) => {
    pageCount = 100 / value;
  });

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

  function updateLoadingStore() {
    dataLoading.set({ isLoading: true });
  }
</script>

<svelte:head>
  <title>CryptoTrackLive Coins</title>
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
  <h4 class="text-text dark:text-dark-text">Sorted by {$sortByStore?.toUpperCase()} - {$sortDirStore?.toUpperCase()}</h4>
</section>

<section class="flex flex-wrap items-center justify-center w-full gap-4 min-w-[320px] mb-4">
  <Overview />
</section>

<section class="relative flex items-center justify-center w-full">
  {#if $dataLoading.isLoading}
    <div class="absolute">
      <Loading />
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
                class="sm:px-4 py-2 xs:text-xs
                     {index === 0 ? 'px-2' : index < 2 ? 'xs:px-0.5' : index >= 4 ? 'px-2' : 'xs:px-8'} 
                     sm:text-base text-text dark:text-dark-text
                     {name.hiddenOnSmall ? 'hidden sm:table-cell' : 'sm:table-cell'} 
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
    {#if !$dataLoading.isLoading}
      <div class="flex justify-between pt-4">
        <!-- Go up button -->
        <div class="relative">
          {#if $entryStore > 10}
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
          <FirstPage on:click={() => pageStore.set(1)} />
          {#if pageCount > 1}
            {#each generatePaginationLinks($pageStore, pageCount) as page}
              <a
                role="button"
                href="?page={page}"
                on:click={() => ($pageStore !== page ? pageStore.set(page) : undefined)}
                class="w-8 flex justify-center items-center py-2 text-text dark:text-dark-text border border-bg/50 dark:border-dark-bg/30 {$pageStore ===
                page
                  ? 'bg-accent dark:bg-dark-accent hover:brightness-150 dark:hover:brigtness-200'
                  : 'hover:brightness-150 dark:hover:brigtness-200 bg-secondary dark:bg-dark-secondary'}">{page}</a
              >
            {/each}
          {/if}
          <LastPage {pageCount} on:click={() => pageStore.set(pageCount)} />
        </div>
      </div>
      <EntryButton {updateLoadingStore} isScrollable={true} />
    {/if}
  </div>
</section>
