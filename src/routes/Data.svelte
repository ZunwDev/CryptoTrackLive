<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import Icon from "svelte-awesome";
  import caretUp from "svelte-awesome/icons/caretUp";
  import caretDown from "svelte-awesome/icons/caretDown";
  import minus from "svelte-awesome/icons/minus";
  import type { CryptoData, HistoricalCryptoData } from "./Data";
  import { formatNumberToHTML, getCurrentUnixTime, getUnixTimeFor7DaysAgo, handleDetailOpen } from "../util/utils";
  import Chart from "chart.js/auto";
  import { currencyStore, updateRate, entryStore, sortDirStore, sortByStore, dataLoading } from "./store";

  let shortenedCurrency = "";
  let updateInterval: number | undefined;
  let sortDirection = "";
  let entryCount = 0;
  let sortBy = "";
  let updateCharts = async () => {};

  onMount(async () => {
    updateCharts = async () => {
      tableData.forEach(async (item, index) => {
        await updateHistoricalData(item.code, getUnixTimeFor7DaysAgo(), getCurrentUnixTime());
        const canvasId = `canvas-${index}`;
        const canvasElement = document && (document.getElementById(canvasId) as HTMLCanvasElement);

        if (canvasElement) {
          destroyChart(canvasElement);
          const prices = historicalTableData.map((item) => item.history);
          const filteredArray = prices.filter((_, index) => index % 2 !== 0);
          createLineChart(canvasElement, filteredArray);
        }
      });
    };

    await updateCharts();
  });

  async function updateAllData() {
    await updateData();
    await updateCharts();
  }

  $: {
    shortenedCurrency = $currencyStore?.slice(0, $currencyStore?.indexOf(" "));
    entryCount = $entryStore;
    sortDirection = $sortDirStore;
    sortBy = $sortByStore;
    updateAllData();
  }

  async function getData() {
    try {
      const response = await fetch("https://api.livecoinwatch.com/coins/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_API_KEY,
        },
        body: JSON.stringify({
          currency: shortenedCurrency,
          sort: sortBy,
          order: sortDirection,
          offset: 0,
          limit: entryCount,
          meta: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    } finally {
      dataLoading.set(false);
    }
  }

  async function getHistoricalData(code: string, startTS: number, endTS: number) {
    try {
      const response = await fetch("https://api.livecoinwatch.com/coins/single/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_API_KEY,
        },
        body: JSON.stringify({
          currency: shortenedCurrency,
          code: code,
          meta: true,
          start: startTS,
          end: endTS,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  }

  async function fetchData() {
    const data = await getData();
    if (data) {
      //console.log("Fetched data:", data);
      return data;
    }
    return [];
  }

  async function fetchHistoricalData(code: string, startTS: number, endTS: number) {
    const data = await getHistoricalData(code, startTS, endTS);
    if (data) {
      //console.log("Fetched data:", data);
      return data;
    }
    return [];
  }

  async function loadTableData(): Promise<CryptoData[]> {
    const cryptocurrencies = (await fetchData()) as CryptoData[];
    if (cryptocurrencies.length > 0) {
      // @ts-ignore
      return cryptocurrencies.map((crypto) => ({
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
        change1h: crypto.delta.hour,
        change24h: crypto.delta.day,
        changeStatus: getChangeStatus(crypto.code, crypto.delta.hour), // Store change status
      }));
    }
    return [];
  }

  async function loadHistoricalTableData( // TS = timestamp
    code: string,
    startTS: number,
    endTS: number
  ): Promise<HistoricalCryptoData[]> {
    const response = await fetchHistoricalData(code, startTS, endTS);

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
    if (storedPreviousChanges) {
      previousChanges = JSON.parse(storedPreviousChanges);
    }
  }

  async function trackCryptoChanges() {
    const currentData = await loadTableData();

    currentData.forEach((crypto) => {
      updatePreviousChange(crypto.code, crypto.change1h);
    });

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
    divElement.innerHTML = `<span class="font-semibold text-text dark:text-dark-text">${crypto.code}</span><span class="block text-sm text-text/30 dark:text-dark-text/30">${crypto.name}</span>`;
    return divElement;
  }

  async function updateData() {
    const newData = await loadTableData();
    if (newData.length > 0) {
      tableData = newData;
    }
  }

  async function updateHistoricalData(code: string, startTS: number, endTS: number) {
    const newData = await loadHistoricalTableData(code, startTS, endTS);
    if (newData.length > 0) {
      historicalTableData = newData;
    }
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

  function destroyChart(canvas: HTMLCanvasElement | null) {
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const chartInstance = Chart.getChart(ctx);
        if (chartInstance) {
          chartInstance.destroy();
        }
      }
    }
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false, title: { display: false, text: "Days" } },
      y: { display: false, title: { display: false, text: "Price" } },
    },
  };

  function createLineChart(canvas: HTMLCanvasElement | null, prices: any[]) {
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      new Chart(ctx, {
        type: "line",
        data: {
          labels: Array.from({ length: prices.length }, (_, i) => `Day ${i + 1}`),
          datasets: [
            {
              label: "",
              fill: true,
              data: prices,
              borderColor: "magenta",
              backgroundColor: "rgba(143, 77, 151, 0.7)",
              borderWidth: 1,
              pointRadius: 0, // Hide points
            },
          ],
        },
        options: chartOptions,
      });
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
    on:click={() => handleDetailOpen(crypto.rank, crypto.name)}
    role="button"
    class="even:bg-bg odd:bg-secondary dark:even:bg-dark-bg dark:odd:bg-dark-secondary hover:bg-secondary/50 dark:hover:bg-dark-secondary/20"
  >
    <td class="px-4 py-2 text-text/30 dark:text-dark-text/30">{crypto.rank}</td>
    <td class="px-4 py-2"><img src={crypto.png64} alt={crypto.code} loading="lazy" class="w-8 h-8" /></td>
    <td class="px-4 py-2">
      {@html displayCurrencyName(crypto).outerHTML}
    </td>
    <td class="px-4 py-2 text-text dark:text-dark-text">
      <canvas id={`canvas-${index}`} width="100" height="0" class="py-2"></canvas>
    </td>
    <td class="px-4 py-2">
      <span class="text-sm text-text/30 dark:text-dark-text/30"> {shortenedCurrency}</span>
      {@html formatNumberToHTML(crypto.rate).outerHTML}
    </td>
    <td class="px-4 py-2">
      <span
        class={crypto.changeStatus === "+"
          ? "text-lime"
          : crypto.changeStatus === "-"
            ? "text-red"
            : "text-text/50 dark:text-dark-text/50"}
      >
        {((Math.abs(crypto.change1h * 100 - 100) * 100) / 100).toFixed(2)}%
        {#if crypto.changeStatus === "+"}
          <Icon data={caretUp} class="scale-75 fill-lime" />
        {:else if crypto.changeStatus === "-"}
          <Icon data={caretDown} class="scale-75 fill-red" />
        {:else}
          <Icon data={minus} class="scale-75 fill-text/50 dark:fill-dark-text/50" />
        {/if}
      </span>
    </td>
    <td class="px-4 py-2">
      <span
        class={crypto.changeStatus === "+"
          ? "text-lime"
          : crypto.changeStatus === "-"
            ? "text-red"
            : "text-text/50 dark:text-dark-text/50"}
      >
        {((Math.abs(crypto.change24h * 100 - 100) * 100) / 100).toFixed(2)}%
        {#if crypto.changeStatus === "+"}
          <Icon data={caretUp} class="scale-75 fill-lime" />
        {:else if crypto.changeStatus === "-"}
          <Icon data={caretDown} class="scale-75 fill-red" />
        {:else}
          <Icon data={minus} class="scale-75 fill-text/50 dark:fill-dark-text/50" />
        {/if}
      </span>
    </td>
    <td class="px-4 py-2">
      <span class="text-sm text-text/30 dark:text-dark-text/30"> {shortenedCurrency}</span>
      {@html formatNumberToHTML(crypto.cap).outerHTML}
    </td>
    <td class="px-4 py-2">
      <span class="text-sm text-text/30 dark:text-dark-text/30"> {shortenedCurrency}</span>
      {@html formatNumberToHTML(crypto.volume).outerHTML}
    </td>
    <td class="px-4 py-2">
      {@html formatNumberToHTML(crypto.circulatingSupply).outerHTML}
    </td>
    <td class="px-4 py-2">
      {@html formatNumberToHTML(crypto.totalSupply).outerHTML}
    </td>
  </tr>
{/each}
