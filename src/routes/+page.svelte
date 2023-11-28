<script lang="ts">
  import { onMount } from "svelte";
  import Icon from "svelte-awesome";
  import ChevronDown from "svelte-awesome/icons/chevronDown";
  import angleDoubleUp from "svelte-awesome/icons/angleDoubleUp";
  import Data from "./Data.svelte";
  import { entryStore } from "./store";
  import { handleClickOutside, scrollToBottom, scrollToTop, toggleMenu } from "../util/utils";

  $: currentEntry = $entryStore;
  let entryButton: HTMLElement | null;
  let entryMenu: HTMLElement | null;

  function updateData(
    newData: string | number,
    element1: HTMLElement | null,
    element2: HTMLElement | null,
    store: any
  ) {
    element1?.setAttribute("aria-hidden", "true");
    element2?.setAttribute("aria-expanded", "false");
    element1?.classList.toggle("hidden");
    store.set(newData);
    setTimeout(() => {
      scrollToBottom();
    }, 2000);
  }

  onMount(() => {
    document.body.classList.add("bg-bg", "dark:bg-dark-bg");
    entryButton = document.getElementById("entries-button");
    entryMenu = document.getElementById("entries-menu");

    window.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (target === entryButton || (entryButton && entryButton.contains(target))) {
        event.stopPropagation();
        toggleMenu(entryMenu, entryButton, entryMenu);
      } else {
        handleClickOutside(event, entryMenu, entryButton);
      }
    });
  });

  let names = ["#", "Icon", "Name", "Chart", "Price", "1h", "24h", "Market Cap", "Volume", "Supply", "Max S."];
  let entries = [10, 25, 50, 75, 100];
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

<section class="flex items-center justify-center">
  <div class="flex flex-col pb-48">
    <div class="xs:overflow-x-auto sm:overflow-x-auto">
      <table class="border-2 xs:overflow-auto sm:overflow-auto border-secondary dark:border-dark-secondary">
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
    <div class="flex justify-between">
      <div class="relative py-4">
        <!-- Go up button -->
        <button
          on:click={() => scrollToTop()}
          class="items-center hidden px-4 py-2 ml-auto transition rounded-lg text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150 lg:block 2xl:block"
        >
          <Icon data={angleDoubleUp} class="scale-125 opacity-50" />
        </button>
      </div>
      <div class="relative py-4">
        <!-- Entries Selector -->
        <button
          id="entries-button"
          aria-expanded="false"
          class="items-center hidden px-2 py-2 ml-auto transition rounded-lg text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150 lg:block 2xl:block"
        >
          {currentEntry} Coins
          <Icon data={ChevronDown} class="scale-75 opacity-50" />
        </button>
        <div
          id="entries-menu"
          tabindex="-1"
          aria-hidden="true"
          class="absolute z-50 hidden w-32 py-1 rounded-md top-16 h-fit bg-secondary dark:bg-dark-secondary"
        >
          <!-- Entries Buttons -->
          {#each entries as entryItem}
            <button
              on:click={() => updateData(entryItem, entryMenu, entryButton, entryStore)}
              class="flex items-center w-full h-8 px-2 text-text dark:text-dark-text bg-secondary dark:bg-dark-secondary hover:bg-accent/30 dark:hover:bg-dark-accent/30 {entryItem ===
              currentEntry
                ? '!bg-accent !dark:bg-dark-accent'
                : ''}"
            >
              {entryItem} Coins
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>
