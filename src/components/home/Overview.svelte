<script lang="ts">
  import { onMount } from "svelte";
  import { currencyStore } from "@store/store";
  import type { OverviewData } from "../../types/Data";
  import { getOverviewData } from "@util/api/api";
  import { OVERVIEW_NAMES } from "@util/constants";
  import { formatNumberToHTML } from "@util/utils";

  let currency: string | undefined;
  let tableData: OverviewData[] = [];

  $: {
    currency = $currencyStore?.slice(0, $currencyStore?.indexOf(" "));
    fetchData();
  }

  async function fetchData() {
    try {
      const response = await getOverviewData();
      if (response) {
        tableData = [
          {
            cap: response.cap || 0,
            volume: response.volume || 0,
            liquidity: response.liquidity || 0,
            btcDominance: response.btcDominance || 0,
          },
        ];
      } else {
        tableData = [];
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  onMount(fetchData);
</script>

{#each tableData as crypto}
  {#each Object.keys(crypto) as key, i}
    <div class="flex flex-col items-center justify-center w-40 h-16 rounded-lg sm:w-48 bg-secondary dark:bg-dark-secondary">
      <h4 class="text-sm font-semibold text-text dark:text-dark-text">{OVERVIEW_NAMES[i]}</h4>
      {#if i < 3}
        <h2 class="!text-2xl text-text dark:text-dark-text font-bold">
          <span class="!text-lg !font-normal text-text/30 dark:text-dark-text/30">{currency}</span>
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
