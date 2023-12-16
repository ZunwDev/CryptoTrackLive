<script lang="ts">
  import { onMount } from "svelte";
  import type { CryptoData, HistoricalCryptoData } from "../../../../types/Data";
  import { getDataSingle, getHistoricalData } from "../../../../util/api";
  import { currencyStore, detailLoading, secondaryDetailLoading } from "../../../../store/store";
  import { MAIN_PAGE_URL } from "../../../../util/constants";
  import {
    convertDaysToDate,
    createLineChart,
    destroyChart,
    formatNumberToHTML,
    getCurrentUnixTime,
    getUnixTimeXDaysAgo,
  } from "../../../../util/utils";

  let currentLoadingState: boolean = $detailLoading;
  let currentSecondaryLoadingState: boolean = $secondaryDetailLoading;
  let shortenedCurrency: string | undefined;
  let tableData: CryptoData[] = [];
  let historicalTableData: HistoricalCryptoData[] = [];
  let isDomReady: boolean = false;
  export let data: any;

  async function updateAllData() {
    if (isDomReady) {
      await updateData();
      await updateHistoricalData(dataObj.code, getUnixTimeXDaysAgo(7), getCurrentUnixTime());
      await updateChart();
    } else return;
  }

  $: {
    shortenedCurrency = $currencyStore?.slice(0, $currencyStore?.indexOf(" "));
    updateAllData();
  }

  let dataObj = data.data[0];

  async function updateChart() {
    const canvasElement = document.getElementById(`canvas-chart`) as HTMLCanvasElement | null;
    if (canvasElement) {
      destroyChart(canvasElement);
      const prices = historicalTableData.map((item) => item.history);
      const filteredArray = prices.filter((_, index) => index % 2 !== 0);
      createLineChart(canvasElement, filteredArray, true, shortenedCurrency);
    }
  }

  async function loadTableData(): Promise<CryptoData[]> {
    const response = (await getDataSingle(shortenedCurrency, dataObj.code)) as CryptoData;
    return [
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
      },
    ];
  }

  async function loadHistoricalTableData( // TS = timestamp
    code: string,
    startTS: number,
    endTS: number
  ): Promise<HistoricalCryptoData[]> {
    const response = await getHistoricalData(code, shortenedCurrency, startTS, endTS);

    if (response && Array.isArray(response.history)) {
      return response.history.map((item: any) => ({
        code: response.code || "-",
        history: item.rate || null,
      }));
    }

    return [];
  }

  async function updateData() {
    const newData = await loadTableData();
    newData.length > 0 && (tableData = newData);
  }

  async function updateHistoricalData(code: string, startTS: number, endTS: number) {
    const newData = await loadHistoricalTableData(code, startTS, endTS);
    newData.length > 0 && (historicalTableData = newData);
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
  onMount(async () => {
    isDomReady = true;
    if (isDomReady) {
      await updateAllData();
      await checkDataReadiness();
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

<section class="max-w-[1200px] min-w-[320px] flex py-8 text-text dark:text-dark-text mx-auto flex-col px-4">
  <span class="text-text/50 dark:text-dark-text/50"
    ><a href={MAIN_PAGE_URL} class="text-left underline text-accent dark:text-dark-accent">Home</a> > {dataObj.code}</span
  >
  <h1 class="mt-4 text-2xl text-text dark:text-dark-text">{dataObj.code} Overview</h1>
  <div class="flex sm:flex-row 2xl:flex-row xs:flex-col gap-4 mt-2 h-[100dvh] relative overflow-hidden min-w-[320px]">
    <div
      class="relative flex flex-col sm:overflow-hidden rounded-lg xs:w-full sm:w-96 2xl:w-96 h-96 min-w-[320px] bg-secondary dark:bg-dark-secondary"
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
                class="object-cover w-8 h-8 rounded-md sm:w-16 2xl:w16 sm:h-16 2xl:w-16"
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

        <div class="flex flex-col items-center justify-center pb-4 border-b border-text/20 dark:border-dark-text/20">
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
    <div class="flex w-full rounded-lg h-96 bg-secondary dark:bg-dark-secondary min-w-[320px] relative">
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
      <div class="flex w-full py-4 sm:flex-row 2xl:flex-row xs:flex-col">
        <div class="flex w-full h-full max-w-full px-2">
          <canvas id="canvas-chart" width="700" height="0"></canvas>
        </div>
        <div
          class="flex items-center justify-center p-2 sm:w-12 2xl:w-12 xs:w-full sm:flex-col 2xl:flex-col xs:flex-row sm:border-l 2xl:border-l xs:border-t sm:border-t-secondary dark:sm:border-t-dark-secondary border-text/20 dark:border-dark-text/20"
        >
          expect coin's media here
        </div>
      </div>
    </div>
  </div>
</section>
