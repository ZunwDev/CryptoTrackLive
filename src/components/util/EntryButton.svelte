<script lang="ts">
  import { entryStore, pageStore } from "@store/store";
  import { ENTRY_AMOUNT } from "@util/constants";
  import { scrollToBottom, scrollToTop } from "@util/scrollUtils";
  import { toggleMenu, handleClickOutside } from "@util/uiUtils";
  import { onMount } from "svelte";
  import { Icon } from "svelte-awesome";

  import { chevronDown, folderOpenO } from "svelte-awesome/icons";
  let entryButton: HTMLElement | null;
  let entryMenu: HTMLElement | null;
  export let updateLoadingStore: any;
  export let isScrollable: boolean = false;

  function updateData(newData: number) {
    pageStore.set(1);
    updateLoadingStore();
    entryMenu?.setAttribute("aria-hidden", "true");
    entryButton?.setAttribute("aria-expanded", "false");
    entryMenu?.classList.toggle("hidden");
    entryStore.set(newData);
    if (isScrollable) {
      if (newData > 10) {
        setTimeout(() => {
          scrollToBottom();
        }, 3000);
      } else {
        setTimeout(() => {
          scrollToTop();
        }, 1000);
      }
    }
  }

  function handleWindowClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target === entryButton || (entryButton && entryButton.contains(target))) {
      event.stopPropagation();
      toggleMenu(entryMenu, entryButton, entryMenu);
    } else {
      handleClickOutside(event, entryMenu, entryButton);
    }
  }

  onMount(async () => {
    window.addEventListener("click", handleWindowClick);
  });
</script>

<div class="relative">
  <button
    bind:this={entryButton}
    aria-expanded="false"
    class="absolute bottom-0 right-0 items-center hidden px-2 py-2 transition rounded-lg text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150 md:inline-flex"
  >
    <Icon data={folderOpenO} class="mr-1 opacity-50" />
    {$entryStore} Entries
    <Icon data={chevronDown} class="ml-1 scale-75 opacity-50" />
  </button>

  <!-- Dropdown menu for entries -->
  <div
    bind:this={entryMenu}
    tabindex="-1"
    aria-hidden="true"
    class="absolute right-0 z-50 hidden w-32 py-1 rounded-md top-1 bg-secondary dark:bg-dark-secondary"
  >
    <!-- Entry selection buttons -->
    {#each ENTRY_AMOUNT as entryItem}
      <button
        on:click={() => updateData(entryItem)}
        class="inline-flex items-center w-full h-8 px-2 text-text dark:text-dark-text bg-secondary dark:bg-dark-secondary hover:bg-accent/30 dark:hover:bg-dark-accent/30 {entryItem ===
        $entryStore
          ? '!bg-accent !dark:bg-dark-accent'
          : ''}"
      >
        {entryItem} Entries
      </button>
    {/each}
  </div>
</div>
