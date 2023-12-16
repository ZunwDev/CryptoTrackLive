<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import Icon from "svelte-awesome";
  import { caretDown, caretUp, minus } from "svelte-awesome/icons";
  import type { CryptoData, HistoricalCryptoData } from "../types/Data";
  import {
    createLineChart,
    destroyChart,
    formatNumberToHTML,
    getCurrentUnixTime,
    getUnixTimeXDaysAgo,
    handleDetailOpen,
  } from "../util/utils";
  import { currencyStore, updateRate, entryStore, sortDirStore, sortByStore, pageStore } from "../store/store";
  import { getData, getHistoricalData } from "../util/api";

  let shortenedCurrency: string | undefined;
  let updateInterval: number | undefined;
  let sortDirection: string | undefined;
  let entryCount: number | undefined;
  let sortBy: string | undefined;
  let currentPage: number | undefined;

  async function updateCharts() {
    if (typeof document === "undefined") return;
    for (const [index, item] of tableData.entries()) {
      await updateHistoricalData(item.code, getUnixTimeXDaysAgo(7), getCurrentUnixTime());
      const canvasElement = document.getElementById(`canvas-${index}`) as HTMLCanvasElement | null;
      if (canvasElement) {
        destroyChart(canvasElement);
        const prices = historicalTableData.map((item) => item.history);
        const filteredArray = prices.filter((_, index) => index % 2 !== 0);
        createLineChart(canvasElement, filteredArray);
      } else return;
    }
  }

  async function updateAllData() {
    await updateData();
    await updateCharts();
  }

  $: {
    shortenedCurrency = $currencyStore?.slice(0, $currencyStore?.indexOf(" "));
    entryCount = $entryStore;
    sortDirection = $sortDirStore;
    sortBy = $sortByStore;
    currentPage = $pageStore;
    updateAllData();
  }

  async function loadTableData(): Promise<CryptoData[]> {
    const response = (await getData(
      shortenedCurrency,
      sortBy,
      sortDirection,
      entryCount,
      currentPage,
      entryCount
    )) as CryptoData[];
    //@ts-ignore
    return response.map((crypto) => ({
      rank: crypto.rank || 0,
      name: crypto.name || "-",
      code: crypto.code || "-",
      rate: crypto.rate || 0,
      change: crypto.change || 0,
      cap: crypto.cap || 0,
      volume: crypto.volume || 0,
      circulatingSupply: crypto.circulatingSupply || 0,
      totalSupply: crypto.totalSupply || 0,
      png64: crypto.png64 || "-",
      change1h: crypto.delta.hour || 0,
      change24h: crypto.delta.day || 0,
      changeStatus: getChangeStatus(crypto.code, crypto.delta.hour),
    }));
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

  let tableData: CryptoData[] = [];
  let historicalTableData: HistoricalCryptoData[] = [];
  let previousChanges: Record<string, number> = {};

  if (browser) {
    const storedPreviousChanges = localStorage.getItem("previousChanges");
    storedPreviousChanges && (previousChanges = JSON.parse(storedPreviousChanges));
  }

  async function trackCryptoChanges() {
    tableData.forEach((crypto) => updatePreviousChange(crypto.code, crypto.change1h));

    if (browser) {
      localStorage.setItem("previousChanges", JSON.stringify(previousChanges));
    }
  }

  function updatePreviousChange(cryptoCode: string, newChange: number) {
    if (previousChanges[cryptoCode] !== newChange) {
      previousChanges[cryptoCode] = newChange;
    }
  }

  function getChangeStatus(cryptoCode: string, newChange: number) {
    const previous = parseFloat(previousChanges[cryptoCode] as unknown as string);
    const change = newChange;

    if (!isNaN(previous) && !isNaN(change)) {
      if (change > previous) {
        return "+";
      } else if (change < previous) {
        return "-";
      } else {
        return "/";
      }
    } else {
      return "?";
    }
  }

  function displayCurrencyName(crypto: CryptoData) {
    const divElement = document.createElement("div");
    divElement.innerHTML = `<span class="font-semibold text-text xs:text-xs sm:text-base 2xl:text-base dark:text-dark-text">${crypto.code}</span><span class="block text-sm xs:text-xs sm:text-base 2xl:text-base text-text/30 dark:text-dark-text/30">${crypto.name}</span>`;
    return divElement;
  }

  async function updateData() {
    const newData = await loadTableData();
    newData.length > 0 && (tableData = newData);
  }

  async function updateHistoricalData(code: string, startTS: number, endTS: number) {
    const newData = await loadHistoricalTableData(code, startTS, endTS);
    newData.length > 0 && (historicalTableData = newData);
  }

  function stopUpdates() {
    clearInterval(updateInterval);
  }

  function startUpdates() {
    updateInterval = setInterval(async () => {
      await updateData();
      trackCryptoChanges();
    }, $updateRate);
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      //stopUpdates();
    } else {
      //startUpdates();
    }
  }

  onMount(async () => {
    await updateData();
    trackCryptoChanges();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    //startUpdates(); //uncomment for live update depending on the update rate time
  });
</script>

{#each tableData as crypto, index}
  <tr
    on:click={() => handleDetailOpen(crypto.rank, crypto.code)}
    role="button"
    class="even:bg-bg odd:bg-secondary max-h-[88px] dark:even:bg-dark-bg dark:odd:bg-dark-secondary hover:bg-secondary/50 dark:hover:bg-dark-secondary/20"
  >
    <td class="py-2 xs:pl-2 sm:px-4 2xl:px-4 text-text/30 dark:text-dark-text/30 xs:text-xs sm:text-base 2xl:text-base"
      >{crypto.rank}</td
    >
    <td class="flex flex-row items-center gap-2 py-2 sm:px-4 2xl:px-4">
      <img src={crypto.png64} alt={crypto.code} loading="lazy" class="w-6 h-6 sm:w-8 sm:h-8 2xl:w-8 2xl:h-8" />
      {@html displayCurrencyName(crypto).outerHTML}
    </td>
    <td class="hidden py-2 sm:px-2 2xl:px-2 text-text dark:text-dark-text sm:table-cell 2xl:table-cell">
      <canvas id={`canvas-${index}`} width="100" height="0" class="py-2 min-h-[48px]"></canvas>
    </td>
    <td class="py-2 sm:px-4 2xl:px-4">
      <!-- On smaller screens (xs) -->
      <div class="xs:flex xs:flex-col xs:items-center sm:hidden 2xl:hidden">
        <span class="mr-1 xs:text-xs text-text/30 dark:text-dark-text/30">
          {shortenedCurrency}
        </span><span class="xs:text-xs sm:text-base 2xl:text-base">
          {@html formatNumberToHTML(crypto.rate).outerHTML}
        </span>
      </div>

      <!-- On larger screens (sm and above) -->
      <div class="hidden sm:flex sm:items-center 2xl:justify-start 2xl:items-center">
        <span class="mr-1 text-sm text-text/30 dark:text-dark-text/30">
          {shortenedCurrency}
        </span>
        <span class="xs:text-xs sm:text-base 2xl:text-base">
          {@html formatNumberToHTML(crypto.rate).outerHTML}
        </span>
      </div>
    </td>
    <td class="py-2 sm:px-4 2xl:px-4 xs:text-xs sm:text-base 2xl:text-base">
      <span
        class={crypto.changeStatus === "+"
          ? "text-lime"
          : crypto.changeStatus === "-"
            ? "text-red"
            : "text-text/50 dark:text-dark-text/50"}
      >
        {((Math.abs(crypto.change1h * 100 - 100) * 100) / 100).toFixed(2)}%{#if crypto.changeStatus === "+"}
          <Icon data={caretUp} class="xs:scale-50 sm:scale-75 2xl:scale-75 fill-lime" />
        {:else if crypto.changeStatus === "-"}
          <Icon data={caretDown} class="xs:scale-50 sm:scale-75 2xl:scale-75 fill-red" />
        {:else}
          <Icon data={minus} class="xs:scale-50 sm:scale-75 2xl:scale-75 fill-text/50 dark:fill-dark-text/50" />
        {/if}
      </span>
    </td>
    <td class="py-2 sm:px-4 2xl:px-4 xs:text-xs sm:text-base 2xl:text-base">
      <span
        class={crypto.changeStatus === "+"
          ? "text-lime"
          : crypto.changeStatus === "-"
            ? "text-red"
            : "text-text/50 dark:text-dark-text/50"}
      >
        {((Math.abs(crypto.change24h * 100 - 100) * 100) / 100).toFixed(2)}%{#if crypto.changeStatus === "+"}
          <Icon data={caretUp} class="xs:scale-50 sm:scale-75 2xl:scale-75 fill-lime" />
        {:else if crypto.changeStatus === "-"}
          <Icon data={caretDown} class="xs:scale-50 sm:scale-75 2xl:scale-75 fill-red" />
        {:else}
          <Icon data={minus} class="xs:scale-50 sm:scale-75 2xl:scale-75 fill-text/50 dark:fill-dark-text/50" />
        {/if}
      </span>
    </td>
    <td class="hidden py-2 sm:px-4 2xl:px-4 sm:table-cell 2xl:table-cell">
      <span class="mr-1 text-sm text-text/30 dark:text-dark-text/30"> {shortenedCurrency}</span>
      {@html formatNumberToHTML(crypto.cap).outerHTML}
    </td>
    <td class="hidden py-2 sm:px-4 2xl:px-4 sm:table-cell 2xl:table-cell">
      <span class="mr-1 text-sm text-text/30 dark:text-dark-text/30"> {shortenedCurrency}</span>
      {@html formatNumberToHTML(crypto.volume).outerHTML}
    </td>
    <td class="hidden py-2 sm:px-4 2xl:px-4 sm:table-cell 2xl:table-cell">
      {@html formatNumberToHTML(crypto.circulatingSupply).outerHTML}
    </td>
    <td class="hidden py-2 sm:px-4 2xl:px-4 sm:table-cell 2xl:table-cell">
      {@html formatNumberToHTML(crypto.totalSupply).outerHTML}
    </td>
  </tr>
{/each}
