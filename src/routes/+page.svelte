<script>
  import { onMount } from "svelte";
  import Data from "./Data.svelte";

  onMount(() => {
    document.body.classList.add("bg-bg", "dark:bg-dark-bg");
  });

  let names = ["#", "Icon", "Name", "Chart", "Price", "1h", "24h", "Market Cap", "Volume", "Supply", "Max S."];
</script>

<svelte:head>
  <title>Home</title>
  <meta name="description" content="Track crypto market live" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet" />
</svelte:head>

<section class="flex items-center justify-center py-8">
  <h2 class="text-2xl text-text dark:text-dark-text">Cryptocurrency Prices Live</h2>
</section>

<section class="flex items-center justify-center py-8 text-text">
  <div class="overflow-x-auto border-2 rounded-md border-secondary dark:border-dark-secondary">
    <table class="">
      <thead>
        <tr class="even:bg-secondary odd:bg-bg dark:even:bg-dark-secondary dark:odd:bg-dark-bg">
          {#each names as name}
            <th class="px-4 py-2 text-text dark:text-dark-text">{name}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        <Data />
      </tbody>
    </table>
  </div>
</section>
