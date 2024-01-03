<script lang="ts">
  import { detailLoadingState } from "@store/store";
  import type { NewsData } from "../../types/Data";
  import { fetchNewsDataById } from "@util/api/fetch";
  import Loading from "@components/util/Loading.svelte";
  import DotSeparator from "@components/util/DotSeparator.svelte";
  import { sortNewsBy } from "@store/store";
  import { Icon } from "svelte-awesome";
  import { reddit, twitter } from "svelte-awesome/icons";
  import { timeAgo } from "@util/dateUtils";

  let currentLoadingState: boolean;
  export let newsData: NewsData[] = [];
  export let socialNewsData: NewsData[] = [];

  detailLoadingState.subscribe((value) => {
    currentLoadingState = value.isLoading;
  });

  async function getImageForNews(id: string | undefined) {
    try {
      let data = await fetchNewsDataById(id);
      return { imgUrl: data.imgUrl };
    } catch (error) {
      console.error("Error fetching image:", error);
      throw error;
    }
  }

  function extractDomainFromLink(link: string) {
    try {
      const url = new URL(link);
      return `${url.protocol}//${url.hostname}`;
    } catch (error) {
      return "";
    }
  }
</script>

{#if !currentLoadingState}
  <div class="flex flex-col gap-4 mt-4 md:flex-row">
    {#each newsData as news, index}
      {#if index === 0}
        <div class="md:w-[448px] w-full h-96 bg-secondary dark:bg-dark-secondary rounded-lg flex-shrink-0">
          {#await getImageForNews(news.id)}
            <p>Loading...</p>
          {:then imgUrl}
            {#if imgUrl.imgUrl !== "-" && !imgUrl.imgUrl.includes("undefined")}
              <a class="flex flex-shrink-0 object-cover w-full h-56 rounded-tl-lg rounded-tr-lg" href={news.link}
                ><img src={imgUrl.imgUrl} loading="lazy" alt={news.title} class="w-full rounded-tl-lg rounded-tr-lg" /></a
              >
            {:else}
              <div class="w-full h-56"></div>
            {/if}
          {:catch error}
            <p>Error loading image</p>
          {/await}
          <div class="flex flex-col gap-2 px-4 py-2">
            <a
              target="_blank"
              href={news.link}
              class="text-xl font-semibold sm:text-2xl lg:text-lg text-text dark:text-dark-text hover:underline"
              style="-webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; display: -webkit-box;"
              >{news.title}</a
            >
            <p
              class="text-sm text-text/50 dark:text-dark-text/50"
              style="-webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; display: -webkit-box;"
            >
              {news.description}
            </p>
            <div class="flex flex-row items-center gap-2 mt-auto">
              <div class="px-1.5 py-1 rounded-md bg-bg dark:bg-dark-bg/30">
                <p class="text-xs text-text dark:text-dark-text/60">New</p>
              </div>
              <a target="_blank" class="text-sm hover:underline" href={extractDomainFromLink(news.link)}>{news.source}</a>
              <DotSeparator />
              <p class="text-sm">{timeAgo(news.createdAt)}</p>
            </div>
          </div>
        </div>
      {/if}
    {/each}
    <div class="flex flex-col w-full gap-2 md:w-96 max-h-96">
      {#each newsData.slice(1, 6) as news, index}
        {#if index > 0}
          <div class="h-[96px] rounded-lg lg:w-96 w-full bg-secondary dark:bg-dark-secondary flex flex-row gap-2">
            {#await getImageForNews(news.id)}
              <p>Loading...</p>
            {:then imgUrl}
              {#if imgUrl.imgUrl !== "-"}
                <a class="flex flex-shrink-0 w-24 h-full" href={news.link}
                  ><img
                    src={imgUrl.imgUrl}
                    loading="lazy"
                    class="object-cover rounded-tl-lg rounded-bl-lg"
                    alt={news.title}
                  /></a
                >
              {:else}
                <div class="flex flex-shrink-0 w-24 h-full rounded-tl-lg rounded-bl-lg"></div>
              {/if}
            {:catch error}
              <p>Error loading image</p>
            {/await}
            <div class="flex flex-col gap-1 py-2 pr-2">
              <a
                target="_blank"
                href={news.link}
                class="text-base font-semibold sm:text-xl md:text-sm text-text dark:text-dark-text hover:underline"
                style="-webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; display: -webkit-box;"
              >
                {news.title}
              </a>

              <div class="flex flex-row items-center gap-2 mt-auto">
                <a target="_blank" class="text-sm hover:underline" href={extractDomainFromLink(news.link)}>
                  {news.source}
                </a>
                <DotSeparator />
                <p class="text-sm">{timeAgo(news.createdAt)}</p>
              </div>
            </div>
          </div>
        {/if}
      {/each}
    </div>
    <div class="w-full mt-6 overflow-hidden rounded-lg h-96 bg-secondary dark:bg-dark-secondary md:mt-0">
      <div class="flex flex-row border-b-2 border-text/20 dark:border-dark-text/20 justify-evenly">
        <button
          on:click={() => sortNewsBy.set("Twitter")}
          class="rounded-tl-lg w-full py-1 flex flex-row gap-2 justify-center items-center {$sortNewsBy === 'Twitter'
            ? 'bg-accent dark:bg-dark-accent'
            : 'bg-secondary dark:bg-dark-secondary hover:bg-accent/30 dark:hover:bg-dark-accent/30'}"
          ><Icon data={twitter} class="scale-125" />Twitter</button
        >
        <button
          on:click={() => sortNewsBy.set("Reddit")}
          class="rounded-tr-lg w-full py-1 flex flex-row gap-2 justify-center items-center {$sortNewsBy === 'Reddit'
            ? 'bg-accent dark:bg-dark-accent'
            : 'bg-secondary dark:bg-dark-secondary hover:bg-accent/30 dark:hover:bg-dark-accent/30'}"
          ><Icon data={reddit} class="scale-125" />Reddit</button
        >
      </div>
      <div
        class="flex flex-col w-full h-full gap-6 pt-2 pb-12 overflow-auto {socialNewsData.length <= 0 &&
          'justify-center items-center'}"
      >
        {#if socialNewsData.length > 0}
          {#each socialNewsData.slice(0, socialNewsData.length) as news}
            <a href={news.link} target="_blank" class="block text-sm hover:underline">
              <div class="flex flex-col w-full gap-2 px-2 font-semibold">
                <p style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                  {$sortNewsBy === "Twitter" ? news.title.slice(news.title.indexOf(":") + 1, news.title.length) : news.title}
                </p>
                <div class="flex flex-row items-center gap-2">
                  {#if $sortNewsBy === "Twitter"}
                    <p class="text-sm !font-normal">{news.title.slice(0, news.title.indexOf(":"))}</p>
                    <DotSeparator />
                  {/if}
                  <p class="text-sm !font-normal">{timeAgo(news.createdAt)}</p>
                </div>
              </div>
            </a>
          {/each}
        {:else}
          <div class="flex items-center justify-center">No posts found</div>
        {/if}
      </div>
    </div>
  </div>
{:else}
  <div class="flex items-center justify-center h-full mt-64">
    <div class="absolute">
      <Loading />
    </div>
  </div>
{/if}
