<script setup lang="ts">
import { RouterView } from 'vue-router'
import UserNavbar from './components/UserNavbar.vue'

const getTrafficSource = () => {
  const params = new URLSearchParams(window.location.search);
  
  const utmMedium = params.get('utm_medium');
  if (utmMedium) sessionStorage.setItem('saved_utm_medium', utmMedium);
  
  const utmCampaign = params.get('utm_campaign');
  if (utmCampaign) sessionStorage.setItem('saved_utm_campaign', utmCampaign);

  const utmSource = params.get('utm_source');
  if (utmSource) return utmSource;
  
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
    <div id="app">
    <!-- Tampilkan UserNavbar HANYA jika BUKAN halaman admin -->
    <UserNavbar v-if="!$route.path.startsWith('/admin')" />
    
    <!-- Tempat konten halaman akan muncul -->
    <RouterView />
  </div>
  </div>
</template>

<style>
/* Active link styles if needed */
.router-link-exact-active {
  /* color: blue; */
}
</style>
