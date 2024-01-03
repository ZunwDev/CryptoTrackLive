<script lang="ts">
  import { pageStore } from "@store/store";
  import { createEventDispatcher } from "svelte";
  import { Icon } from "svelte-awesome";
  import { angleDoubleRight } from "svelte-awesome/icons";

  export let pageCount: number;

  export let on: Record<string, any> = {};
  const dispatch = createEventDispatcher();

  function handleClick() {
    if ($pageStore !== pageCount) {
      dispatch("click", { $pageStore });
    }
    if (on.click && typeof on.click === "function") {
      on.click();
    }
  }
</script>

<a
  role="button"
  on:click={handleClick}
  href={`?page=${pageCount}`}
  class="px-3 py-2 rounded-tr-lg rounded-br-lg border border-bg/50 dark:border-dark-bg/30 bg-secondary dark:bg-dark-secondary {$pageStore ===
  pageCount
    ? 'opacity-70 cursor-not-allowed'
    : 'hover:brightness-150 dark:hover:brigtness-200'}"
  ><Icon data={angleDoubleRight} class="scale-100 opacity-50 text-text dark:text-dark-text"></Icon></a
>
