<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

const getTrafficSource = () => {
  const utm = new URLSearchParams(window.location.search).get('utm_source');
  if (utm) return utm;
  
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
  <div class="min-h-screen bg-white text-ff">
    <!-- Navbar -->
    <header class="bg-fbg border-b border-gray-200 py-4 px-8 flex justify-between items-center sticky top-0 z-50">
      <div class="text-2xl font-bold">
        <RouterLink to="/">Atlas</RouterLink>
      </div>
      <nav class="flex gap-6 items-center">
        <RouterLink to="/" class="hover:text-blue-600 transition font-medium">Home</RouterLink>
        <RouterLink to="/assessment" class="hover:text-blue-600 transition font-medium">Assessment</RouterLink>
        <RouterLink to="/contact-sales" class="hover:text-blue-600 transition font-medium">Contact Sales</RouterLink>
        <RouterLink to="/waitlist" class="hover:text-blue-600 transition font-medium">Waitlist</RouterLink>
        <RouterLink to="/partner-inquiry" class="hover:text-blue-600 transition font-medium">Partner Inquiry</RouterLink>
        <RouterLink to="/requestdemo" class="hover:text-blue-600 transition font-medium">Request Demo</RouterLink>
      </nav>
    </header>

    <!-- Main Content -->
    <RouterView />
  </div>
</template>

<style>
/* Active link styles if needed */
.router-link-exact-active {
  /* color: blue; */
}
</style>
