<script>
  import Header from "../components/Header.svelte";
  import Footer from "../components/Footer.svelte";
  import "../app.css";
</script>

<div class="flex flex-col min-h-[100dvh]">
  <Header />

  <main class="flex-1">
    <slot />
  </main>

  <Footer />
</div>
