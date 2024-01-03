<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import Icon from "svelte-awesome";
  import { caretDown, caretUp, minus } from "svelte-awesome/icons";
  import type { CryptoData, HistoricalCryptoData } from "../../types/Data";
  import { currencyStore, entryStore, sortDirStore, sortByStore, pageStore } from "@store/store";
  import { fetchHistoricalData } from "@util/api/fetch";
  import { fetchMultipleCoinData } from "@util/api/fetch/fetchMultipleCoinData";
  import { destroyChartById, createLineChartMultiple, destroyChart } from "@util/chartUtils";
  import { formatNumberToHTML } from "@util/numberUtils";
  import { handleDetailOpen } from "@util/uiUtils";

  let currency: string | undefined;
  //let updateInterval: number | undefined; //uncomment for live update depending on the update rate time

  let isDomReady: boolean = false;

  //Data
  let tableData: CryptoData[] = [];
  let historicalTableData: HistoricalCryptoData[] = [];
  let previousChanges: Record<string, number> = {};

  async function updateCharts() {
    if (typeof document === "undefined") return;
    for (const [index, item] of tableData.entries()) {
      historicalTableData = await fetchHistoricalData(item.code);
      const canvasElement = document.getElementById(`canvas-${index}`) as HTMLCanvasElement | null;
      if (canvasElement) {
        destroyChartById(canvasElement);
        const prices = historicalTableData.map((item) => item.history);
        createLineChartMultiple(canvasElement, prices);
      } else return;
    }
  }

  async function updateAllData() {
    if (isDomReady) {
      await fetchMainData();
      await updateCharts();
      await trackCryptoChanges();
    }
  }

  currencyStore.subscribe((value) => {
    currency = value?.slice(0, value?.indexOf(" "));
    updateAllData();
  });

  [entryStore, sortDirStore, sortByStore, pageStore].forEach((store) => {
    store.subscribe(updateAllData);
  });

  async function fetchMainData() {
    try {
      if (isDomReady) {
        tableData = (await fetchMultipleCoinData(previousChanges)) as CryptoData[];
        historicalTableData = (await fetchHistoricalData(tableData?.[0]?.code)) as HistoricalCryptoData[];
      } else return;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  if (browser) {
    const storedPreviousChanges = localStorage.getItem("previousChanges");
    storedPreviousChanges && (previousChanges = JSON.parse(storedPreviousChanges));
  }

  async function trackCryptoChanges() {
    for (const crypto of tableData) {
      previousChanges[crypto.code] = crypto.change1h;
    }

    if (browser) {
      localStorage.setItem("previousChanges", JSON.stringify(previousChanges));
    }
  }

  function displayCurrencyName(crypto: CryptoData) {
    const divElement = document.createElement("div");
    divElement.innerHTML = `<span class="text-xs font-semibold text-text sm:text-base dark:text-dark-text">${crypto.code}</span><span class="block text-xs sm:text-base text-text/30 dark:text-dark-text/30">${crypto.name}</span>`;
    return divElement;
  }

  //uncomment for live update depending on the update rate time
  /*   function stopUpdates() {
    clearInterval(updateInterval);
  }

  function startUpdates() {
    updateInterval = setInterval(async () => {
      await fetchData();
      trackCryptoChanges();
    }, $updateRate);
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      //stopUpdates();
    } else {
      //startUpdates();
    }
  } */

  onMount(async () => {
    isDomReady = true;
    destroyChart();
    await fetchMainData();
    await updateCharts();
    await trackCryptoChanges();
    //document.addEventListener("visibilitychange", handleVisibilityChange); //uncomment for live update depending on the update rate time
    //startUpdates(); //uncomment for live update depending on the update rate time
  });
</script>

{#each tableData as crypto, index}
  <tr
    on:click={() => handleDetailOpen(crypto.rank, crypto.code)}
    role="button"
    class="even:bg-bg odd:bg-secondary max-h-[88px] dark:even:bg-dark-bg dark:odd:bg-dark-secondary hover:bg-secondary/50 dark:hover:bg-dark-secondary/20"
  >
    <td class="py-2 pl-2 text-xs sm:px-4 text-text/30 dark:text-dark-text/30 sm:text-base">{crypto.rank}</td>
    <td class="flex flex-row items-center gap-2 py-2 sm:px-4">
      <img src={crypto.png64} alt={crypto.code} loading="lazy" class="w-6 h-6 sm:w-8 sm:h-8" />
      {@html displayCurrencyName(crypto).outerHTML}
    </td>
    <td class="hidden py-2 sm:px-2 text-text dark:text-dark-text sm:table-cell">
      <canvas id={`canvas-${index}`} width="100" height="0" class="py-2"></canvas>
    </td>
    <td class="py-2 sm:px-4">
      <!-- On smaller screens (xs) -->
      <div class="xs:flex xs:flex-col xs:items-center sm:hidden">
        <span class="mr-1 text-xs sm:text-base text-text/30 dark:text-dark-text/30">
          {currency}
        </span><span class="text-xs sm:text-base">
          {@html formatNumberToHTML(crypto.rate).outerHTML}
        </span>
      </div>

      <!-- On larger screens (sm and above) -->
      <div class="hidden sm:flex sm:items-center">
        <span class="mr-1 text-sm text-text/30 dark:text-dark-text/30">
          {currency}
        </span>
        <span class="text-xs sm:text-base">
          {@html formatNumberToHTML(crypto.rate).outerHTML}
        </span>
      </div>
    </td>
    <td class="py-2 text-xs sm:px-4 sm:text-base">
      <span
        class={crypto.changeStatus === "+"
          ? "text-lime"
          : crypto.changeStatus === "-"
            ? "text-red"
            : "text-text/50 dark:text-dark-text/50"}
      >
        {((Math.abs(crypto.change1h * 100 - 100) * 100) / 100).toFixed(2)}%{#if crypto.changeStatus === "+"}
          <Icon data={caretUp} class="scale-50 sm:scale-75 fill-lime" />
        {:else if crypto.changeStatus === "-"}
          <Icon data={caretDown} class="scale-50 sm:scale-75 fill-red" />
        {:else}
          <Icon data={minus} class="scale-50 sm:scale-75 fill-text/50 dark:fill-dark-text/50" />
        {/if}
      </span>
    </td>
    <td class="py-2 text-xs sm:px-4 sm:text-base">
      <span
        class={crypto.changeStatus === "+"
          ? "text-lime"
          : crypto.changeStatus === "-"
            ? "text-red"
            : "text-text/50 dark:text-dark-text/50"}
      >
        {((Math.abs(crypto.change24h * 100 - 100) * 100) / 100).toFixed(2)}%{#if crypto.changeStatus === "+"}
          <Icon data={caretUp} class="scale-50 sm:scale-75 fill-lime" />
        {:else if crypto.changeStatus === "-"}
          <Icon data={caretDown} class="scale-50 sm:scale-75 fill-red" />
        {:else}
          <Icon data={minus} class="scale-50 sm:scale-75 fill-text/50 dark:fill-dark-text/50" />
        {/if}
      </span>
    </td>
    <td class="hidden py-2 sm:px-4 sm:table-cell">
      <span class="mr-1 text-sm text-text/30 dark:text-dark-text/30"> {currency}</span>{@html formatNumberToHTML(crypto.cap)
        .outerHTML}
    </td>
    <td class="hidden py-2 sm:px-4 sm:table-cell">
      <span class="mr-1 text-sm text-text/30 dark:text-dark-text/30"> {currency}</span>{@html formatNumberToHTML(crypto.volume)
        .outerHTML}
    </td>
    <td class="hidden py-2 sm:px-4 sm:table-cell">
      {@html formatNumberToHTML(crypto.circulatingSupply).outerHTML}
    </td>
    <td class="hidden py-2 sm:px-4 sm:table-cell">
      {@html formatNumberToHTML(crypto.totalSupply).outerHTML}
    </td>
  </tr>
{/each}
