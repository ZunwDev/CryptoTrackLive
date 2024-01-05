<script lang="ts">
  import { onMount } from "svelte";
  import { Icon } from "svelte-awesome";
  import { moonO, sunO } from "svelte-awesome/icons";
  import { writable } from "svelte/store";

  let darkModeIconElement: HTMLElement;

  const darkMode = writable(false);
  function toggleDarkMode() {
    darkMode.update((mode) => {
      const isDark = document.documentElement.classList.toggle("dark", !mode);
      localStorage.setItem("color-theme", isDark ? "dark" : "");
      const iconToChange = darkModeIconElement?.firstChild as HTMLElement;
      iconToChange?.classList.toggle("rotate-45", !isDark);
      return !mode;
    });
  }
  onMount(() => {
    const storedMode = localStorage.getItem("color-theme");
    if (storedMode === "dark" || (!storedMode && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      toggleDarkMode();
    }
  });
</script>

<button
  bind:this={darkModeIconElement}
  on:click={toggleDarkMode}
  name="Dark mode"
  class="relative items-center hidden w-10 h-10 overflow-hidden transition rounded-lg text-text bg-secondary dark:text-dark-text dark:bg-dark-secondary hover:brightness-150 md:block"
>
  <span class="absolute inset-0 flex items-center justify-center transition-all duration-400">
    {#if $darkMode}
      <Icon data={moonO}></Icon>
    {:else}
      <Icon data={sunO}></Icon>
    {/if}
  </span>
</button>
