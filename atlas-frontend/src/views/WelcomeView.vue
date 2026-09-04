<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="min-h-screen bg-white">
    <div class="flex flex-col items-center justify-center min-h-[80vh] px-8 text-center">
      <h1 class="text-5xl font-extrabold text-[#000000] sm:text-6xl lg:text-7xl mb-6 animate-mask-in">
        Welcome to Atlas
      </h1>
      <p class="mt-6 max-w-2xl text-lg leading-7 text-ff sm:text-xl sm:leading-8 mb-10 animate-mask-in delay-100">
        Empower your business with AI-driven insights. Streamline your workflows, boost productivity, and unlock new possibilities with the Atlas platform.
      </p>
      <div class="flex gap-4 flex-wrap justify-center animate-mask-in delay-200">
        <router-link
          to="/requestdemo"
          class="bg-[#2D2D2D] hover:bg-gray-700 transition-colors duration-200 text-white font-semibold py-4 px-8 rounded-md"
        >
          Request a Demo
        </router-link>
        <router-link
          to="/assessment"
          class="bg-[#2D2D2D] hover:bg-gray-700 transition-colors duration-200 text-white font-semibold py-4 px-8 rounded-md"
        >
          Request Assessment
        </router-link>
        <router-link
          to="/partner-inquiry"
          class="bg-[#2D2D2D] hover:bg-gray-700 transition-colors duration-200 text-white font-semibold py-4 px-8 rounded-md"
        >
          Partner Inquiry
        </router-link>
        <router-link
          to="/contact-sales"
          class="bg-[#2D2D2D] hover:bg-gray-700 transition-colors duration-200 text-white font-semibold py-4 px-8 rounded-md"
        >
          Contact Sales
        </router-link>
        <router-link
          to="/waitlist"
          class="bg-[#2D2D2D] hover:bg-gray-700 transition-colors duration-200 text-white font-semibold py-4 px-8 rounded-md"
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

<style scoped>
.animate-mask-in {
  opacity: 0;
  animation: mask-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes mask-in {
  0% {
    clip-path: inset(100% 0 0 0);
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    clip-path: inset(0 0 0 0);
    opacity: 1;
    transform: translateY(0);
  }
}

.delay-100 {
  animation-delay: 100ms;
}
.delay-200 {
  animation-delay: 200ms;
}
</style>