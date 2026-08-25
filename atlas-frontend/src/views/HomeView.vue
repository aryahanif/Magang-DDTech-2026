<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="min-h-screen bg-white">
    <div class="flex flex-col items-center justify-center min-h-[80vh] px-8 text-center">
      <h1 class="text-5xl font-extrabold text-ff sm:text-6xl lg:text-7xl mb-6">
        Welcome to Atlas
      </h1>
      <p class="mt-6 max-w-2xl text-lg leading-7 text-ff sm:text-xl sm:leading-8 mb-10">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor veritatis beatae alias! Doloremque mollitia recusandae dolor laborum consequuntur earum culpa minus atque laboriosam, magnam error nemo quisquam dolore ipsum tenetur.
      </p>
      <div class="flex gap-4 flex-wrap justify-center">
        <router-link
          to="/requestdemo"
          class="bg-ff text-white font-semibold py-4 px-8 rounded-md"
        >
          Request a Demo
        </router-link>
        <router-link
          to="/assessment"
          class="bg-ff text-white font-semibold py-4 px-8 rounded-md"
        >
          Request Assessment
        </router-link>
        <router-link
          to="/partner-inquiry"
          class="bg-ff text-white font-semibold py-4 px-8 rounded-md"
        >
          Partner Inquiry
        </router-link>
        <router-link
          to="/contact-sales"
          class="bg-ff text-white font-semibold py-4 px-8 rounded-md"
        >
          Contact Sales
        </router-link>
        <router-link
          to="/waitlist"
          class="bg-ff text-white font-semibold py-4 px-8 rounded-md"
        >
          Waitlist
        </router-link>
      </div>  
    </div>
  </main>
<!-- Contoh di bagian footer HomeView.vue -->
<footer class="mt-12 text-center text-xs text-gray-400">
  <p>(c) 2026 Atlas AI.</p>
  <a href="/admin" class="hover:text-gray-600 transition-colors inline-block mt-2">
    Staff Login ->
  </a>
</footer>
</template>