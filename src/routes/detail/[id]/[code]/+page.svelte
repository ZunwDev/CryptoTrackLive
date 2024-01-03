<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";

  // Constants
  import { LINK_ICONS, MAIN_PAGE_URL } from "@util/constants";

  // Utility Functions
  import { checkDataReadiness, createDetailLineChart, generatePaginationLinks } from "@util/utils";

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
    searchedTerm,
    sortNewsBy,
  } from "@store/store";
  import type { CryptoData, ExchangeData, FiatData, HistoricalCryptoData, MarketData, NewsData } from "../../../../types/Data";
  import { ChartDisplay, CoinOverview, MarketOverview, Media, News } from "@components/detail";
  import { FirstPage, LastPage } from "@components/pagination";
  import { EntryButton } from "@components/util";

  export let data: any;

  let currency: string | undefined = $currencyStore;
  let usdToTargetCurrencyRate: number;

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

  let pageCount: number = 100 / $entryStore;

  let exchangeDataLoaded: boolean = false;
  let isDomReady: boolean = false;

  currencyStore.subscribe((value) => {
    currency = value?.slice(0, value?.indexOf(" "));
    setChartToZero();
    fetchMainData();
    fetchExchangeRelatedData();
  });

  sortNewsBy.subscribe(() => {
    fetchMainData();
  });

  chartDaysAgo.subscribe(() => {
    setChartToZero();
    fetchMainData();
  });

  entryStore.subscribe((value) => {
    pageCount = 100 / value;
    fetchExchangeRelatedData();
  });

  pageStore.subscribe(() => {
    fetchExchangeRelatedData();
  });

  page.subscribe(() => {
    dataObj = data.data[0];
  });

  searchedTerm.subscribe(async () => {
    [linksWithIcons, socialNewsData] = [[], []];
    detailLoadingState.set({ isLoading: true });
    exchangeLoadingState.set({ isLoading: true });
    setTimeout(async () => {
      setChartToZero();
      await fetchMainData();
      await fetchExchangeRelatedData();
    }, 100);
  });

  function setChartToZero() {
    if (isDomReady) {
      const canvasElement = document.getElementById(`canvas-chart`) as HTMLCanvasElement | null;
      if (canvasElement) {
        const initialData = new Array(101).fill(0);
        createDetailLineChart(canvasElement, initialData, initialData);
      }
    }
  }

  async function updateChart() {
    setTimeout(() => {
      const canvasElement = document.getElementById(`canvas-chart`) as HTMLCanvasElement | null;
      if (canvasElement) {
        const prices = historicalTableData.map((item) => item.history);
        const dates = historicalTableData.map((item) => item.date);
        createDetailLineChart(canvasElement, prices, dates);
      }
    }, 100);
  }

  async function fetchMainData() {
    try {
      if (isDomReady) {
        tableData = (await fetchCoinData(dataObj.code)) as CryptoData[];
        historicalTableData = (await fetchHistoricalData(dataObj.code)) as HistoricalCryptoData[];
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

  async function fetchExchangeRelatedData() {
    try {
      // Set the flag to indicate exchange data loading
      exchangeDataLoaded = false;

      if (isDomReady) {
        marketData = (await fetchMarketData(dataObj.code, $entryStore, $pageStore)) as MarketData[];
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

  function updateLoadingStore() {
    exchangeLoadingState.set({ isLoading: true });
  }

  function updatePage(page: number) {
    pageStore.set(page);
    updateLoadingStore();
  }

  onMount(async () => {
    window.addEventListener("popstate", () => (window.location.href = MAIN_PAGE_URL)); // Redirect user back to home page from any detail page
    isDomReady = true;
  });
</script>

<svelte:head>
  <title>CryptoTrackLive Detail - {dataObj.code}</title>
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
          class="relative flex flex-col overflow-hidden rounded-lg xs:w-full min-w-[320px] h-96 bg-secondary dark:bg-dark-secondary {$detailLoadingState.isLoading
            ? 'animate-pulse'
            : ''}"
        >
          <CoinOverview {tableData} {dataObj} />
        </div>
        <div
          class="h-12 w-full md:w-[320px] overflow-x-auto rounded-lg bg-secondary dark:bg-dark-secondary min-w-[320px] {$detailLoadingState.isLoading
            ? 'animate-pulse'
            : ''}"
        >
          <Media {linksWithIcons} />
        </div>
      </div>
      <div
        class="flex w-full rounded-lg h-[448px] bg-secondary dark:bg-dark-secondary min-w-[320px] flex-col gap-2 relative px-2 {$detailLoadingState.isLoading
          ? 'animate-pulse'
          : ''}"
      >
        <ChartDisplay {dataObj} {currency} />
      </div>
    </div>
  </div>
  <h1 class="mt-8 text-2xl text-text dark:text-dark-text">{dataObj.code} Markets</h1>
  <div class="w-full pb-4 mt-2">
    <MarketOverview {usdToTargetCurrencyRate} {exchangeDataLoaded} {marketData} />
  </div>
  {#if exchangeDataLoaded && !$exchangeLoadingState.isLoading}
    <div class="flex items-center justify-center mx-auto">
      <FirstPage on:click={() => updatePage(1)} />
      {#if pageCount > 1}
        {#each generatePaginationLinks($pageStore, pageCount) as page}
          <a
            href={`?page=${page}`}
            on:click={() => ($pageStore !== page ? updatePage(page) : undefined)}
            class="w-8 flex justify-center items-center py-2 text-text dark:text-dark-text border border-bg/50 dark:border-dark-bg/30 {$pageStore ===
            page
              ? 'bg-accent dark:bg-dark-accent hover:brightness-150 dark:hover:brigtness-200'
              : 'hover:brightness-150 dark:hover:brigtness-200 bg-secondary dark:bg-dark-secondary'}">{page}</a
          >
        {/each}
      {/if}
      <LastPage {pageCount} on:click={() => updatePage(pageCount)} />
    </div>
    <EntryButton {updateLoadingStore} />
  {/if}
  <h1 class="mt-8 text-2xl text-text dark:text-dark-text">{dataObj.code} Latest News</h1>
  <News {newsData} {socialNewsData} />
</section>
