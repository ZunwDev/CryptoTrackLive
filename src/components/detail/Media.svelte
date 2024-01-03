<script lang="ts">
  interface Link {
    url: any;
    icon: any;
  }
  import { Icon } from "svelte-awesome";
  export let linksWithIcons: Link[] = [];
</script>

<div class="flex flex-wrap items-center justify-start gap-2 px-4 py-2">
  {#each linksWithIcons as link}
    <a
      title={link.url}
      href={link.url}
      class="flex items-center justify-center w-8 h-8 transition rounded-full group bg-text/20 dark:bg-dark-text/20 hover:text-text dark:hover:text-dark-text"
    >
      <Icon
        data={link.icon}
        class="flex items-center justify-center w-6 h-6 transition scale-75 text-text/50 dark:text-dark-text/50 group-hover:text-text dark:group-hover:text-dark-text"
      ></Icon>
    </a>
  {/each}
</div>
