<script lang="ts">
  import { currencyStore, exchangeLoadingState } from "@store/store";
  import { Loading } from "@components/util";
  import type { MarketData } from "../../types/Data";
  import { formatNumberToHTML, convertCurrency } from "@util/numberUtils";

  let currentExchangeLoadingState: boolean;
  export let usdToTargetCurrencyRate: number;
  export let marketData: MarketData[];
  let currency: string | undefined;
  export let exchangeDataLoaded: boolean;

  currencyStore.subscribe((value) => {
    currency = value?.slice(0, value?.indexOf(" "));
  });

  let names: { name: string; hiddenOnSmall?: boolean }[] = [
    { name: "Exchange" },
    { name: "Market" },
    { name: "Price" },
    { name: "Volume", hiddenOnSmall: true },
    { name: "Actions" },
  ];
  exchangeLoadingState.subscribe((value) => {
    currentExchangeLoadingState = value.isLoading;
  });

  function isCurrencySupported(currency: string | undefined) {
    return currency !== "BTC" && currency !== "ETH";
  }
</script>

{#if currentExchangeLoadingState}
  <div class="flex items-center justify-center h-full mt-32">
    <div class="absolute">
      <Loading />
    </div>
  </div>
{:else}
  <table class="border w-full table-auto border-secondary dark:border-dark-secondary min-w-[320px]">
    <thead
      ><tr class="even:bg-secondary odd:bg-bg dark:even:bg-dark-secondary dark:odd:bg-dark-bg">
        {#each names as name}
          <!-- Table header columns -->
          <th class="py-2 text-xs sm:px-4 sm:text-base {name.hiddenOnSmall && 'hidden md:table-cell'}">
            {name.name}
          </th>
        {/each}
      </tr>
    </thead>

    <tbody>
      {#each marketData as data}
        <tr
          class="even:bg-bg odd:bg-secondary max-h-[88px] dark:even:bg-dark-bg dark:odd:bg-dark-secondary hover:bg-secondary/50 dark:hover:bg-dark-secondary/20"
        >
          <td class="py-2 mr-1 text-xs text-center sm:text-base">{data.exchange}</td>
          <td class="py-2 mr-1 text-xs text-center sm:text-base">{data.pair}</td>
          <td class="py-2 mr-1 text-xs text-center sm:text-base">
            <div class="flex flex-col items-center justify-center md:flex-row">
              <span class="mr-1 text-sm text-text/30 dark:text-dark-text/30">
                {currency}
              </span>
              <span class="text-xs sm:text-base">
                {#if isCurrencySupported(currency)}
                  {@html formatNumberToHTML(Number(convertCurrency(data.price, usdToTargetCurrencyRate))).outerHTML}
                {:else}
                  <span class="text-red dark:text-dark-red">N/A</span>
                {/if}
              </span>
            </div>
          </td>
          <td class="flex-row hidden py-2 mr-1 text-xs text-center sm:text-base md:table-cell">
            <span class="mr-1 text-sm text-text/30 dark:text-dark-text/30">
              {currency}
            </span>
            <span class="text-xs sm:text-base">
              {#if isCurrencySupported(currency)}
                {@html formatNumberToHTML(Number(convertCurrency(data.volume, usdToTargetCurrencyRate))).outerHTML}
              {:else}
                <span class="text-red dark:text-dark-red">N/A</span>
              {/if}
            </span>
          </td>
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
