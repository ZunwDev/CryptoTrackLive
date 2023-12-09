<script>
  import github from "svelte-awesome/icons/github";
  import Icon from "svelte-awesome";
</script>

<footer class="bg-secondary dark:bg-dark-secondary">
  <div class="flex flex-col items-center justify-center py-8">
    <p class="text-text dark:text-dark-text">Made with ❤️ by ZunwDev</p>
    <div class="flex mt-4 space-x-2">
      <a
        href="https://github.com/ZunwDev"
        target="_blank"
        class="text-text dark:text-dark-text hover:text-text/30 dark:hover:text-dark-text/30"
      >
        <Icon data={github} class="w-8 h-8"></Icon>
      </a>
      <!-- Add other social icons similarly -->
    </div>
    <p class="mt-4 text-sm text-text dark:text-dark-text">
      &copy; 2023 CryptoTrackLive. All rights reserved. <a
        class="underline hover:text-text/30 dark:hover:text-dark-text/30"
        href="https://github.com/ZunwDev/CryptoTrack/blob/main/LICENSE"
        target="_blank">MIT</a
      > License
    </p>
  </div>
</footer>
