<script lang="ts">
  import { detailLoadingState } from "@store/store";
  import Loading from "@components/util/Loading.svelte";

  let currentLoadingState: boolean;
  let chartLoaded: boolean = false;

  detailLoadingState.subscribe((value) => {
    currentLoadingState = value.isLoading;
  });

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
  >
    <!-- <Loading /> -->
  </div>
{/if}

<div class="w-full h-full">
  <canvas id="canvas-chart"></canvas>
</div>
