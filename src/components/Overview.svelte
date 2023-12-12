<script lang="ts">
  import { onMount } from "svelte";
  import { currencyStore } from "../store/store";
  import type { OverviewData } from "../types/Data";
  import { getOverviewData } from "../util/api";
  import { OVERVIEW_NAMES } from "../util/constants";
  import { formatNumberToHTML } from "../util/utils";

  let shortenedCurrency: string | undefined;
  let tableData: OverviewData[] = [];

  async function updateAllData() {
    await updateData();
  }

  $: {
    shortenedCurrency = $currencyStore?.slice(0, $currencyStore?.indexOf(" "));
    updateAllData();
  }

  async function updateData() {
    const newData = await loadTableData();
    tableData = newData.length > 0 ? newData : [];
  }

  async function loadTableData(): Promise<OverviewData[]> {
    const response = await getOverviewData(shortenedCurrency);
    return response
      ? [
          {
            cap: response.cap || 0,
            volume: response.volume || 0,
            liquidity: response.liquidity || 0,
            btcDominance: response.btcDominance || 0,
          },
        ]
      : [];
  }

  onMount(async () => {
    await updateData();
  });
</script>

{#each tableData as crypto}
  {#each Object.keys(crypto) as key, i}
    <div
      class="flex flex-col items-center justify-center h-16 rounded-lg xs:w-40 sm:w-48 2xl:w-48 bg-secondary dark:bg-dark-secondary"
    >
      <h4 class="text-sm text-text dark:text-dark-text">{OVERVIEW_NAMES[i]}</h4>
      {#if i < 3}
        <h2 class="!text-2xl text-text dark:text-dark-text font-bold">
          {@html formatNumberToHTML(Number(crypto[key])).outerHTML}
        </h2>
      {:else}
        <h2 class="!text-2xl text-text dark:text-dark-text font-bold">
          {((Math.abs(Number(crypto[key]) * 100 - 100) * 100) / 100).toFixed(2)}%
        </h2>
      {/if}
    </div>
  {/each}
{/each}
