<script lang="ts">
  import { chartDaysAgo, detailLoadingState } from "@store/store";

  let currentLoadingState: boolean;
  let chartLoaded: boolean = false;
  export let dataObj: any;
  export let currency: string | undefined;

  detailLoadingState.subscribe((value) => {
    currentLoadingState = value.isLoading;
  });

  function updateChartZoom(value: number) {
    chartDaysAgo.set(value);
  }

  const zooms: any[] = [1, 7, 30, 90, 365, "ALL"];

  setTimeout(() => {
    chartLoaded = true;
  }, 4000);
</script>

{#if !chartLoaded}
  <div
    class="absolute top-0 left-0 flex items-center justify-center w-full h-full {$detailLoadingState.isLoading
      ? 'animate-pulse'
      : ''}"
    style="display: {currentLoadingState ? 'flex' : 'none'}"
  ></div>
{/if}

<div class="flex justify-between w-full px-2 py-2">
  <p class="justify-start text-lg font-semibold lg:text-2xl">{dataObj.code} Price Chart ({currency})</p>
  <div class="flex flex-wrap justify-end gap-1 lg:flex-row lg:gap-1.5">
    {#each zooms as zoom}
      <button
        title={zoom === "ALL" ? "01.01.2016" : undefined}
        on:click={() => updateChartZoom(zoom)}
        class="flex items-center justify-center w-fit px-2 border rounded-lg h-fit border-text/50 dark:border-dark-text/20 {zoom ===
        $chartDaysAgo
          ? 'bg-accent dark:bg-dark-accent dark:text-text text-dark-text'
          : 'hover:bg-accent/30 dark:hover:bg-dark-accent/30'}">{zoom}{zoom !== "ALL" ? "D" : ""}</button
      >
    {/each}
  </div>
</div>
<div class="w-full h-full pt-4 pb-2">
  <canvas id="canvas-chart"></canvas>
</div>
