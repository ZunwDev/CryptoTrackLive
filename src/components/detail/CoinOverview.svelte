<script lang="ts">
  import { currencyStore, detailLoadingState } from "@store/store";
  import type { CryptoData } from "../../types/Data";
  import { convertDaysToDate } from "@util/dateUtils";
  import { formatNumberToHTML } from "@util/numberUtils";

  let currentLoadingState: boolean;
  export let tableData: CryptoData[];
  let currency: string | undefined;
  export let dataObj: any;

  detailLoadingState.subscribe((value) => {
    currentLoadingState = value.isLoading;
  });

  currencyStore.subscribe((value) => {
    currency = value?.slice(0, value?.indexOf(" "));
  });
</script>

{#if !currentLoadingState}
  <div class="flex items-center w-full gap-3 p-4">
    {#if tableData[0]?.png64}
      <div class="flex-shrink-0">
        <img class="object-cover w-8 h-8 rounded-md sm:w-16 sm:h-16" src={tableData[0].png64} alt={dataObj.code} />
      </div>
      <div class="flex flex-col w-full truncate">
        <span class="text-xl font-semibold truncate text-text dark:text-dark-text">{tableData[0].name}</span>
        <span class="text-sm truncate text-text/50 dark:text-dark-text/50">{dataObj.code}</span>
      </div>
    {/if}
    <div class="absolute w-32 h-32 overflow-hidden rotate-45 bg-accent dark:bg-dark-accent top-[-96px] right-[-64px]">
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
        {currency}
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
      <span class="text-text dark:text-dark-text">{@html formatNumberToHTML(Number(tableData[0]?.cap)).outerHTML}</span>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-text/50 dark:text-dark-text/50">Volume:</span>
      <span class="text-text dark:text-dark-text">
        <span class="xs:text-xs text-text/50 dark:text-dark-text/50">
          {currency}
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
      <span class="text-text dark:text-dark-text">{@html formatNumberToHTML(Number(tableData[0]?.totalSupply)).outerHTML}</span>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-text/50 dark:text-dark-text/50">Max Supply:</span>
      <span class="text-text dark:text-dark-text">{@html formatNumberToHTML(Number(tableData[0]?.maxSupply)).outerHTML}</span>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-text/50 dark:text-dark-text/50">Released:</span>
      <span class="text-text dark:text-dark-text">{convertDaysToDate(tableData[0]?.age)}</span>
    </div>
  </div>
{/if}
