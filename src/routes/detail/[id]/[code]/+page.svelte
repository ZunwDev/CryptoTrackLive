<script lang="ts">
  import { onMount } from "svelte";
  import type { CryptoData, ExchangeData, FiatData, HistoricalCryptoData, MarketData } from "../../../../types/Data";
  import Icon from "svelte-awesome";
  import {
    getDataSingle,
    getExchangeTickerData,
    getFiatData,
    getHistoricalData,
    getMarketTickerData,
  } from "../../../../util/api";
  import {
    currencyStore,
    detailLoading,
    entryStore,
    exchangeLoading,
    fiatsLoading,
    marketLoading,
    pageStore,
    secondaryDetailLoading,
  } from "../../../../store/store";
  import { ENTRY_AMOUNT, LINK_ICONS, MAIN_PAGE_URL } from "../../../../util/constants";
  import {
    convertCurrency,
    convertDaysToDate,
    createLineChart,
    destroyChart,
    formatNumberToHTML,
    generatePaginationLinks,
    getCurrentUnixTime,
    getUnixTimeXDaysAgo,
    handleClickOutside,
    toggleMenu,
  } from "../../../../util/utils";
  import { page } from "$app/stores";
  import { angleDoubleLeft, angleDoubleRight, chevronDown, folderOpenO } from "svelte-awesome/icons";

  export let data: any;

  let currentLoadingState: boolean = $detailLoading;
  let currentSecondaryLoadingState: boolean = $secondaryDetailLoading;

  let currentMarketLoadingState: boolean = $marketLoading;
  let currentExchangeLoadingState: boolean = $exchangeLoading;
  let currentFiatLoadingState: boolean = $fiatsLoading;

  let entryButton: HTMLElement | null;
  let entryMenu: HTMLElement | null;

  let shortenedCurrency: string | undefined;
  let usdToTargetCurrencyRate: number | undefined;
  let entryCount: number | undefined;

  //Data
  let tableData: CryptoData[] = [];
  let marketData: MarketData[] = [];
  let fiatData: FiatData[] = [];
  let exchangeData: ExchangeData[] = [];
  let historicalTableData: HistoricalCryptoData[] = [];

  let filteredLinks: [string, any][];
  let linksWithIcons: any = [];
  let dataObj = data.data[0];

  let currentPage: number = $pageStore;
  let pageCount: number = 100 / $entryStore;

  let exchangeDataLoaded: boolean = false;
  let isDomReady: boolean = false;

  let names: { name: string; hiddenOnSmall?: boolean }[] = [
    { name: "Exchange" },
    { name: "Market" },
    { name: "Price" },
    { name: "Volume", hiddenOnSmall: true },
    { name: "Actions" },
  ];

  async function updateAllData() {
    if (isDomReady) {
      dataObj = data.data[0];
      await fetchData();
      await fetchHistoricalData(dataObj.code, getUnixTimeXDaysAgo(7), getCurrentUnixTime());
      await updateChart();
      await checkDataReadiness();
    } else return;
  }

  async function updateExchangeData() {
    exchangeDataLoaded = false;
    if (isDomReady) {
      dataObj = data.data[0];
      await fetchMarketData(dataObj.code);
      await fetchExchangeData();
      await fetchFiatData();
      await checkExchangeDataReadiness();
      marketData.forEach((market) => {
        const exchange = exchangeData.find(
          (ex) => ex.name === (market.exchange === "BinanceFutures" ? "Binance Futures" : market.exchange)
        );

        if (exchange) {
          market.url = exchange.url || "-";
          market.icon = exchange.icon || "-";
        }
      });
      exchangeDataLoaded = true;
    } else return;
  }

  $: {
    shortenedCurrency = $currencyStore?.slice(0, $currencyStore?.indexOf(" "));
    updateAllData();
  }

  $: {
    shortenedCurrency = $currencyStore?.slice(0, $currencyStore?.indexOf(" "));
    entryCount = $entryStore;
    currentPage = $pageStore;
    pageCount = 100 / $entryStore;
    updateExchangeData();
  }

  async function updateChart() {
    const canvasElement = document.getElementById(`canvas-chart`) as HTMLCanvasElement | null;
    if (canvasElement) {
      const parent = canvasElement.parentElement;
      if (parent) {
        canvasElement.width = parent.clientWidth;
        canvasElement.height = parent.clientHeight;
      }

      destroyChart(canvasElement);
      const prices = historicalTableData.map((item) => item.history);
      const filteredArray = prices.filter((_, index) => index % 2 !== 0);
      createLineChart(canvasElement, filteredArray, true, shortenedCurrency);
    }
  }

  page.subscribe(async (value) => {
    currentLoadingState = true;
    currentSecondaryLoadingState = true;
    currentExchangeLoadingState = true;
    currentFiatLoadingState = true;
    currentMarketLoadingState = true;
    await updateAllData();
    await updateExchangeData();
  });

  async function fetchData() {
    try {
      const response = (await getDataSingle(shortenedCurrency, dataObj.code)) as CryptoData;
      if (response) {
        tableData = [
          //@ts-ignore
          {
            rank: response.rank || 0,
            name: response.name || "-",
            rate: response.rate || 0,
            code: response.code || "",
            change: response.delta?.hour || 0,
            cap: response.cap || 0,
            volume: response.volume || 0,
            circulatingSupply: response.circulatingSupply || 0,
            totalSupply: response.totalSupply || 0,
            maxSupply: response.maxSupply || 0,
            png64: response.png64 || "-",
            change1h: response.delta?.hour || 0,
            change24h: response.delta?.day || 0,
            age: response.age || 0,
            allTimeHighUSD: response.allTimeHighUSD || 0,
            links: response.links,
          },
        ];
      } else {
        tableData = [];
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      filteredLinks = Object.entries(tableData[0].links).filter(([key, value]) => value !== null);
      linksWithIcons = filteredLinks.map(([type, url]) => {
        return {
          type,
          url,
          icon: LINK_ICONS[type] || "",
        };
      });
    }
  }

  async function fetchMarketData(coin: string) {
    try {
      const response = (await getMarketTickerData(coin, entryCount, currentPage)) as MarketData[];
      if (response) {
        //@ts-ignore
        marketData = response.result.map((item: MarketData) => ({
          exchange: item.exchange || "-",
          from: item.from || "-",
          pair: item.pair || "-",
          price: item.price || 0,
          volume: item.volume || 0,
        }));
      } else {
        marketData = [];
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function fetchFiatData() {
    try {
      const response = (await getFiatData()) as FiatData[];
      if (response) {
        fiatData = response.map((item: FiatData) => ({
          name: item.name,
          rate: item.rate,
        }));
        usdToTargetCurrencyRate = fiatData.find((currency) => currency.name === shortenedCurrency)?.rate || 0;
      } else {
        fiatData = [];
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function fetchExchangeData() {
    try {
      const response = (await getExchangeTickerData()) as ExchangeData[];
      if (response) {
        exchangeData = response.map((item: ExchangeData) => ({
          name: item.name || "-",
          url: item.url || "-",
          icon: item.icon || "-",
        }));
      } else {
        exchangeData = [];
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function fetchHistoricalData(code: string, startTS: number, endTS: number) {
    // TS = timestamp
    try {
      const response = await getHistoricalData(code, shortenedCurrency, startTS, endTS);
      if (response) {
        historicalTableData = response.history.map((item: any) => ({
          code: response.code || "-",
          history: item.rate || null,
        }));
      } else {
        historicalTableData = [];
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  function updateData(newData: number, element1: HTMLElement | null, element2: HTMLElement | null, store: any) {
    pageStore.set(1);
    currentExchangeLoadingState = true;
    currentFiatLoadingState = true;
    currentMarketLoadingState = true;
    element1?.setAttribute("aria-hidden", "true");
    element2?.setAttribute("aria-expanded", "false");
    element1?.classList.toggle("hidden");
    store.set(newData);
  }

  async function checkDataReadiness(): Promise<void> {
    return new Promise((resolve) => {
      const int = setInterval(() => {
        if (tableData.length > 0 && historicalTableData.length > 0) {
          currentLoadingState = false;
          currentSecondaryLoadingState = false;
          clearInterval(int);
          resolve();
        }
      }, 0);
    });
  }
  async function checkExchangeDataReadiness(): Promise<void> {
    return new Promise((resolve) => {
      const int = setInterval(() => {
        if (marketData.length > 0 && fiatData.length > 0 && exchangeData.length > 0) {
          currentExchangeLoadingState = false;
          currentFiatLoadingState = false;
          currentMarketLoadingState = false;
          clearInterval(int);
          resolve();
        }
      }, 0);
    });
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
    currentExchangeLoadingState = true;
    currentFiatLoadingState = true;
    currentMarketLoadingState = true;
  }

  onMount(async () => {
    window.addEventListener("click", handleWindowClick);
    isDomReady = true;
    if (isDomReady) {
      await updateAllData();
      await updateExchangeData();
    } else return;
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
          {#if currentLoadingState}
            <div class="flex items-center justify-center h-full">
              <div class="absolute">
                <div class="lds-ring">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            </div>
          {:else if tableData.length > 0 && historicalTableData.length > 0}
            <div class="flex items-center w-full gap-3 p-4">
              {#if tableData[0]?.png64}
                <div class="flex-shrink-0">
                  <img
                    class="object-cover w-8 h-8 rounded-md sm:w-16 sm:h-16"
                    src={tableData[0].png64}
                    alt={dataObj.code}
                  />
                </div>
                <div class="flex flex-col w-full truncate">
                  <span class="text-xl font-semibold truncate text-text dark:text-dark-text">{tableData[0].name}</span>
                  <span class="text-sm truncate text-text/50 dark:text-dark-text/50">{dataObj.code}</span>
                </div>
              {/if}
              <div
                class="absolute w-32 h-32 overflow-hidden rotate-45 bg-accent dark:bg-dark-accent top-[-96px] right-[-64px]"
              >
                <p
                  class="absolute {dataObj.id >= 100
                    ? 'right-6'
                    : dataObj.id >= 10
                      ? 'right-8'
                      : 'right-10'} top-[100px] text-text dark:text-dark-text"
                >
                  {dataObj.id}
                </p>
              </div>
            </div>

            <div
              class="flex flex-col items-center justify-center pb-4 border-b border-text/20 dark:border-dark-text/20"
            >
              <span class="text-2xl text-text dark:text-dark-text">
                <span class="text-base text-text/50 dark:text-dark-text/50">
                  {shortenedCurrency}
                </span>{@html formatNumberToHTML(Number(tableData[0]?.rate)).outerHTML}
              </span>
              <span class="text-base text-text dark:text-dark-text"
                >ATH:
                <span class="text-xs text-text/50 dark:text-dark-text/50"> USD </span>{@html formatNumberToHTML(
                  Number(tableData[0]?.allTimeHighUSD)
                ).outerHTML}
              </span>
            </div>

            <!-- Information -->
            <div class="flex flex-col gap-1 p-4">
              <div class="flex items-center justify-between">
                <span class="text-text/50 dark:text-dark-text/50">Rank:</span>
                <span class="text-text dark:text-dark-text">#{tableData[0]?.rank}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-text/50 dark:text-dark-text/50">Market Cap:</span>
                <span class="text-text dark:text-dark-text"
                  >{@html formatNumberToHTML(Number(tableData[0]?.cap)).outerHTML}</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span class="text-text/50 dark:text-dark-text/50">Volume:</span>
                <span class="text-text dark:text-dark-text">
                  <span class="xs:text-xs text-text/50 dark:text-dark-text/50">
                    {shortenedCurrency}
                  </span>{@html formatNumberToHTML(Number(tableData[0]?.volume)).outerHTML}</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span class="text-text/50 dark:text-dark-text/50">Circ. Supply:</span>
                <span class="text-text dark:text-dark-text"
                  >{@html formatNumberToHTML(Number(tableData[0]?.circulatingSupply)).outerHTML}</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span class="text-text/50 dark:text-dark-text/50">Total Supply:</span>
                <span class="text-text dark:text-dark-text"
                  >{@html formatNumberToHTML(Number(tableData[0]?.totalSupply)).outerHTML}</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span class="text-text/50 dark:text-dark-text/50">Max Supply:</span>
                <span class="text-text dark:text-dark-text"
                  >{@html formatNumberToHTML(Number(tableData[0]?.maxSupply)).outerHTML}</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span class="text-text/50 dark:text-dark-text/50">Released:</span>
                <span class="text-text dark:text-dark-text">{convertDaysToDate(tableData[0]?.age)}</span>
              </div>
            </div>
          {/if}
        </div>
        <div
          class="h-12 w-full md:w-[320px] overflow-x-auto rounded-lg bg-secondary dark:bg-dark-secondary min-w-[320px]"
        >
          <div class="flex flex-wrap items-center justify-start gap-2 px-4 py-2">
            {#each linksWithIcons as link}
              <a
                href={link.url}
                class="flex items-center justify-center w-8 h-8 transition rounded-full group bg-text/20 dark:bg-dark-text/20 hover:text-text dark:hover:text-dark-text"
              >
                <Icon
                  data={link.icon}
                  class="flex items-center justify-center w-6 h-6 transition scale-75 text-text/50 dark:text-dark-text/50 group-hover:text-text dark:group-hover:text-dark-text"
                ></Icon>
              </a>
            {/each}
          </div>
        </div>
      </div>
      <div class="flex w-full rounded-lg h-[448px] bg-secondary dark:bg-dark-secondary min-w-[320px] relative">
        <div
          class="absolute top-0 left-0 flex items-center justify-center w-full h-full"
          style="display: {currentSecondaryLoadingState ? 'flex' : 'none'}"
        >
          <div class="lds-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
        <div class="w-full h-full px-2">
          <canvas id="canvas-chart" style="width: 100%; height: 100%;"></canvas>
        </div>
      </div>
    </div>
    <div class="flex sm:flex-row flex-col gap-4 mt-2 relative overflow-hidden min-w-[320px]"></div>
  </div>
  <h1 class="mt-4 text-2xl text-text dark:text-dark-text">{dataObj.code} Exchanges</h1>
  <div class="w-full pb-4 mt-1">
    {#if currentMarketLoadingState && currentExchangeLoadingState && currentFiatLoadingState}
      <div class="flex items-center justify-center h-full mt-32">
        <div class="absolute">
          <div class="lds-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    {:else}
      <table class="border w-full table-auto border-secondary dark:border-dark-secondary min-w-[320px]">
        <thead
          ><tr class="even:bg-secondary odd:bg-bg dark:even:bg-dark-secondary dark:odd:bg-dark-bg">
            {#each names as name, index}
              <!-- Table header columns -->
              <th class="py-2 text-xs sm:px-4 sm:text-base {name.hiddenOnSmall && 'hidden sm:table-cell'}">
                {name.name}
              </th>
            {/each}
          </tr>
        </thead>

        <tbody>
          {#each marketData as data, index}
            <tr
              class="even:bg-bg odd:bg-secondary max-h-[88px] dark:even:bg-dark-bg dark:odd:bg-dark-secondary hover:bg-secondary/50 dark:hover:bg-dark-secondary/20"
            >
              <td class="py-2 mr-1 text-xs text-center sm:text-base">{data.exchange}</td>
              <td class="py-2 mr-1 text-xs text-center sm:text-base">{data.pair}</td>
              <td class="py-2 mr-1 text-xs text-center sm:text-base">
                <div class="flex flex-col items-center justify-center md:flex-row">
                  <!-- Updated class -->
                  <span class="mr-1 text-sm text-text/30 dark:text-dark-text/30">
                    {shortenedCurrency}
                  </span>
                  <span class="text-xs sm:text-base">
                    {@html formatNumberToHTML(Number(convertCurrency(data.price, usdToTargetCurrencyRate))).outerHTML}
                  </span>
                </div>
              </td>
              <td class="hidden py-2 mr-1 text-xs text-center sm:text-base md:table-cell">
                <span class="mr-1 text-sm text-text/30 dark:text-dark-text/30">
                  {shortenedCurrency}
                </span><span class="text-xs sm:text-base">
                  {@html formatNumberToHTML(Number(convertCurrency(data.volume, usdToTargetCurrencyRate))).outerHTML}
                </span></td
              >
              <td class="py-2 mr-1 text-xs text-center sm:text-base">
                {#if exchangeDataLoaded && data.url && data.url !== "-"}
                  <a
                    href={data.url}
                    target="_blank"
                    class="font-semibold underline uppercase text-accent dark:text-dark-accent hover:text-accent/50 dark:hover:text-dark-accent/50"
                  >
                    Trade now
                  </a>
                {:else}
                  <span class="text-text/30 dark:text-dark-text/30">-</span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
  {#if !currentMarketLoadingState && !currentExchangeLoadingState && !currentFiatLoadingState}
    <div class="flex items-center justify-center mx-auto">
      <a
        role="button"
        on:click={() => (currentPage !== 1 ? updatePage(1) : undefined)}
        href={currentPage !== 1 ? "?page=1" : undefined}
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
            href="?page={page}"
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
        href={currentPage !== pageCount ? `?page=${pageCount}` : undefined}
        class="px-3 py-2 rounded-tr-lg rounded-br-lg border border-bg/50 dark:border-dark-bg/30 bg-secondary dark:bg-dark-secondary {currentPage ===
        pageCount
          ? 'opacity-70 cursor-not-allowed'
          : 'hover:brightness-150 dark:hover:brigtness-200'}"
        ><Icon data={angleDoubleRight} class="scale-100 opacity-50 text-text dark:text-dark-text"></Icon></a
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
</section>
