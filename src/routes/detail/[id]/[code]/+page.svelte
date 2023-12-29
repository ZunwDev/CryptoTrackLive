<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { Icon } from "svelte-awesome";
  import { angleDoubleLeft, angleDoubleRight, chevronDown, folderOpenO } from "svelte-awesome/icons";
  import Media from "@components/detail/Media.svelte";

  // Constants
  import { ENTRY_AMOUNT, LINK_ICONS, MAIN_PAGE_URL } from "@util/constants";

  // Utility Functions
  import {
    checkDataReadiness,
    createDetailLineChart,
    generatePaginationLinks,
    getCurrentUnixTime,
    getUnixTimeXDaysAgo,
    handleClickOutside,
    toggleMenu,
  } from "@util/utils";

  // API Fetch Functions
  import {
    fetchCoinData,
    fetchHistoricalData,
    fetchNewsData,
    fetchMarketData,
    fetchExchangeData,
    fetchFiatData,
  } from "@util/api/fetch/index";
  import {
    chartDaysAgo,
    currencyStore,
    detailLoadingState,
    entryStore,
    exchangeLoadingState,
    pageStore,
    sortNewsBy,
  } from "@store/store";
  import type { CryptoData, ExchangeData, FiatData, HistoricalCryptoData, MarketData, NewsData } from "../../../../types/Data";
  import CoinOverview from "@components/detail/CoinOverview.svelte";
  import ChartDisplay from "@components/detail/ChartDisplay.svelte";
  import MarketOverview from "@components/detail/MarketOverview.svelte";
  import News from "@components/detail/News.svelte";

  export let data: any;

  let entryButton: HTMLElement | null;
  let entryMenu: HTMLElement | null;

  let currency: string | undefined = $currencyStore;
  let usdToTargetCurrencyRate: number | undefined;
  let entryCount: number | undefined;

  //Data
  let tableData: CryptoData[] = [];
  let marketData: MarketData[] = [];
  let fiatData: FiatData[] = [];
  let exchangeData: ExchangeData[] = [];
  let historicalTableData: HistoricalCryptoData[] = [];
  let newsData: NewsData[] = [];
  let socialNewsData: NewsData[] = [];

  let linksWithIcons: any = [];
  let dataObj = data.data[0];
  let sortNews: string;

  let currentPage: number = $pageStore;
  let pageCount: number = 100 / $entryStore;
  let chartZoom: number = $chartDaysAgo;

  let exchangeDataLoaded: boolean = false;
  let isDomReady: boolean = false;

  currencyStore.subscribe((value) => {
    currency = value?.slice(0, value?.indexOf(" "));
    setChartToZero();
    fetchMainData();
    fetchExchangeRelData();
  });

  $: {
    sortNews = $sortNewsBy;
    fetchMainData();
  }

  $: {
    entryCount = $entryStore;
    currentPage = $pageStore;
    pageCount = 100 / $entryStore;
    fetchExchangeRelData();
  }

  function setChartToZero() {
    if (isDomReady) {
      const canvasElement = document.getElementById(`canvas-chart`) as HTMLCanvasElement | null;
      if (canvasElement) {
        const initialData = new Array(50).fill(0);
        createDetailLineChart(canvasElement, initialData);
      }
    }
  }

  async function updateChart() {
    const canvasElement = document.getElementById(`canvas-chart`) as HTMLCanvasElement | null;
    if (canvasElement) {
      const parent = canvasElement.parentElement;
      if (parent) {
        canvasElement.width = parent.clientWidth;
        canvasElement.height = parent.clientHeight;
      }

      const prices = historicalTableData.map((item) => item.history);
      const filteredArray = prices.filter((_, index) => index % 2 !== 0);
      createDetailLineChart(canvasElement, filteredArray);
    }
  }

  let oldDataObj = data.data[0];
  page.subscribe(async (value) => {
    dataObj = data.data[0];
    detailLoadingState.set({ isLoading: true });
    exchangeLoadingState.set({ isLoading: true });
    setChartToZero();
    if (oldDataObj != dataObj) {
      await fetchMainData();
      await fetchExchangeRelData();
    }
  });

  async function fetchMainData() {
    try {
      if (isDomReady) {
        //Reset links with icons
        linksWithIcons = [];
        socialNewsData = [];

        tableData = (await fetchCoinData(dataObj.code)) as CryptoData[];
        historicalTableData = (await fetchHistoricalData(
          dataObj.code,
          getUnixTimeXDaysAgo(chartZoom),
          getCurrentUnixTime()
        )) as HistoricalCryptoData[];
        newsData = (await fetchNewsData(tableData?.[0]?.name || "")) as NewsData[];

        // Generate links with icons
        linksWithIcons = generateFilteredLinks(tableData);

        // Sort news data by createdAt
        sortNewsData(newsData);

        await updateChart();
        await checkDataReadiness([tableData, historicalTableData, newsData], detailLoadingState);
      } else {
        return;
      }
    } catch (error) {
      return console.error("Error fetching main overview data:", error);
    }
  }

  async function fetchExchangeRelData() {
    try {
      // Set the flag to indicate exchange data loading
      exchangeDataLoaded = false;

      if (isDomReady) {
        marketData = (await fetchMarketData(dataObj.code, entryCount, currentPage)) as MarketData[];
        exchangeData = (await fetchExchangeData()) as ExchangeData[];
        fiatData = (await fetchFiatData()) as FiatData[];

        // Get rate to convert from usd to something else
        usdToTargetCurrencyRate = fiatData.find((curr) => curr.name === currency)?.rate || 0;

        // Check if exchange-related data is ready
        await checkDataReadiness([marketData, exchangeData, fiatData], exchangeLoadingState);

        // Update market data with exchange information
        marketData.forEach((market) => {
          const exchange = exchangeData.find(
            (ex) => ex.name === (market.exchange === "BinanceFutures" ? "Binance Futures" : market.exchange)
          );

          if (exchange) {
            market.url = exchange.url || "-";
            market.icon = exchange.icon || "-";
          }
        });

        // Set the flag to indicate successful loading of exchange-related data
        exchangeDataLoaded = true;
      } else {
        return;
      }
    } catch (error) {
      return console.error("Error fetching exchange/market data:", error);
    }
  }

  function generateFilteredLinks(tableData: CryptoData[]): any[] {
    return Object.entries(tableData?.[0]?.links || {})
      .filter(([_, value]) => value !== null)
      .map(([type, url]) => ({
        type,
        url,
        icon: LINK_ICONS[type] || "",
      }));
  }

  function sortNewsData(newsData: NewsData[]) {
    const excludedSources = [".fr", ".es"];
    const excludedTerms = ["twitter", "cointribune", "turk", "benelux", "coinotag", "reddit", "investorplace", "coincodex"];
    const includedTerms = [$sortNewsBy.toString().toLowerCase()];

    const uniqueTitles = new Set<string>();
    const filteredAndSorted = newsData
      .filter(
        (item) =>
          !excludedSources.some((source) => item.source.toLowerCase().includes(source)) &&
          !excludedTerms.some((link) => item.link.toLowerCase().includes(link))
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((item) => {
        const titleLower = item.title.toLowerCase();
        if (!uniqueTitles.has(titleLower)) {
          uniqueTitles.add(titleLower);
          return true;
        }
        return false;
      });

    const filteredAndSortedSocialData = newsData
      .filter((item) => includedTerms.some((link) => item.link.toLowerCase().includes(link)))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((item) => {
        const titleLower = item.title.toLowerCase();
        if (!uniqueTitles.has(titleLower)) {
          uniqueTitles.add(titleLower);
          return true;
        }
        return false;
      });

    newsData.length = 0;
    newsData.push(...filteredAndSorted);

    socialNewsData.length = 0;
    socialNewsData.push(...filteredAndSortedSocialData);
  }

  function updateData(newData: number, element1: HTMLElement | null, element2: HTMLElement | null, store: any) {
    pageStore.set(1);
    exchangeLoadingState.set({ isLoading: true });
    element1?.setAttribute("aria-hidden", "true");
    element2?.setAttribute("aria-expanded", "false");
    element1?.classList.toggle("hidden");
    store.set(newData);
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

  function updatePage(page: number) {
    pageStore.set(page);
    exchangeLoadingState.set({ isLoading: true });
  }

  onMount(async () => {
    isDomReady = true;
    window.addEventListener("click", handleWindowClick);
    window.addEventListener("popstate", () => (window.location.href = MAIN_PAGE_URL)); // Redirect user back to home page from any detail page
    await fetchMainData();
    await fetchExchangeRelData();
  });
</script>

<svelte:head>
  <title>Detail - {dataObj.code}</title>
  <meta charset="UTF-8" />
  <meta name="description" content="App for crypto tracking" />
  <meta name="author" content="ZunwDev" />
  <meta name="keywords" content="HTML, CSS, JavaScript, Svelte" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet" />
</svelte:head>

<section class="max-w-[1200px] min-w-[320px] flex py-8 text-text dark:text-dark-text mx-auto flex-col px-4 pb-32">
  <span class="text-text/50 dark:text-dark-text/50"
    ><a href={MAIN_PAGE_URL} class="text-left underline text-accent dark:text-dark-accent">Home</a> > {dataObj.code}</span
  >
  <h1 class="mt-4 text-2xl text-text dark:text-dark-text">{dataObj.code} Overview</h1>
  <div class="flex flex-col gap-2">
    <div class="flex md:flex-row flex-col gap-4 mt-2 relative overflow-hidden min-w-[320px]">
      <div class="flex flex-col gap-4">
        <div
          class="relative flex flex-col overflow-hidden rounded-lg xs:w-full min-w-[320px] h-96 bg-secondary dark:bg-dark-secondary"
        >
          <CoinOverview {tableData} {historicalTableData} {dataObj} />
        </div>
        <div class="h-12 w-full md:w-[320px] overflow-x-auto rounded-lg bg-secondary dark:bg-dark-secondary min-w-[320px]">
          <Media {linksWithIcons} />
        </div>
      </div>
      <div class="flex w-full rounded-lg h-[448px] bg-secondary dark:bg-dark-secondary min-w-[320px] relative">
        <ChartDisplay />
      </div>
    </div>
  </div>
  <h1 class="mt-4 text-2xl text-text dark:text-dark-text">{dataObj.code} Markets</h1>
  <div class="w-full pb-4 mt-2">
    <MarketOverview {usdToTargetCurrencyRate} {exchangeDataLoaded} {marketData} />
  </div>
  {#if exchangeDataLoaded && !$exchangeLoadingState.isLoading}
    <div class="flex items-center justify-center mx-auto">
      <button
        on:click={() => (currentPage !== 1 ? updatePage(1) : undefined)}
        class="px-3 py-2 rounded-tl-lg rounded-bl-lg border border-bg/50 dark:border-dark-bg/30 bg-secondary dark:bg-dark-secondary {currentPage ===
        1
          ? 'opacity-70 cursor-not-allowed'
          : 'hover:brightness-150 dark:hover:brigtness-200'}"
        ><Icon data={angleDoubleLeft} class="scale-100 opacity-50 text-text dark:text-dark-text"></Icon></button
      >
      {#if pageCount > 1}
        {#each generatePaginationLinks(currentPage, pageCount) as page}
          <button
            on:click={() => (currentPage !== page ? updatePage(page) : undefined)}
            class="w-8 flex justify-center items-center py-2 text-text dark:text-dark-text border border-bg/50 dark:border-dark-bg/30 {currentPage ===
            page
              ? 'bg-accent dark:bg-dark-accent hover:brightness-150 dark:hover:brigtness-200'
              : 'hover:brightness-150 dark:hover:brigtness-200 bg-secondary dark:bg-dark-secondary'}">{page}</button
          >
        {/each}
      {/if}
      <button
        on:click={() => (currentPage !== pageCount ? updatePage(pageCount) : undefined)}
        class="px-3 py-2 rounded-tr-lg rounded-br-lg border border-bg/50 dark:border-dark-bg/30 bg-secondary dark:bg-dark-secondary {currentPage ===
        pageCount
          ? 'opacity-70 cursor-not-allowed'
          : 'hover:brightness-150 dark:hover:brigtness-200'}"
        ><Icon data={angleDoubleRight} class="scale-100 opacity-50 text-text dark:text-dark-text"></Icon></button
      >
    </div>
    <div class="relative">
      <button
        bind:this={entryButton}
        id="entries-button"
        aria-expanded="false"
        class="absolute bottom-0 right-0 items-center hidden px-2 py-2 transition rounded-lg text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150 md:inline-flex"
      >
        <Icon data={folderOpenO} class="mr-1 opacity-50" />
        {entryCount} Coins
        <Icon data={chevronDown} class="ml-1 scale-75 opacity-50" />
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
            entryCount
              ? '!bg-accent !dark:bg-dark-accent'
              : ''}"
          >
            {entryItem} Coins
          </button>
        {/each}
      </div>
    </div>
  {/if}
  <h1 class="mt-4 text-2xl text-text dark:text-dark-text">{dataObj.code} Latest News</h1>
  <News {newsData} {socialNewsData} />
</section>
