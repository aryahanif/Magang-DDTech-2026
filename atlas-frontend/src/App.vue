<script setup lang="ts">
import Form from "./components/form.vue";
const getTrafficSource = () => {
  // Untuk utm_source
  const utm = new URLSearchParams(window.location.search).get('utm_source');
  if (utm) return utm;
  
  // Untuk referrer
  const referrer = document.referrer.toLowerCase();
  if (referrer.includes('google.com')) return 'google_organic';
  if (referrer.includes('bing.com')) return 'bing_organic';
  
  return 'direct';
};

if (!sessionStorage.getItem('saved_traffic_source')) {
  sessionStorage.setItem('saved_traffic_source', getTrafficSource());
}
</script>

<template>
  <main class="min-h-screen bg-white">
    <div class="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      <section class="flex flex-col justify-center gap-6 px-8 py-16 sm:px-16 lg:px-24">
        <div class="max-w-xl">
          <h1
            class="text-5xl font-extrabold  text-ff sm:text-6xl lg:text-7xl"
          >
            Request a<br />
            Demo
          </h1>

          <p
            class="mt-6 max-w-lg text-lg leading-7 text-ff sm:text-xl sm:leading-8"
          >
            Streamline operations, qualify leads faster, and reclaim hours of
            your day. See exactly how our custom automation solutions can work
            for your business.
          </p>
        </div>
      </section>

      <section class="flex items-center justify-center bg-ff px-5 py-12 sm:px-8 lg:px-12">
        <Form />
      </section>
    </div>
  </main>
</template>

<style scoped></style>
