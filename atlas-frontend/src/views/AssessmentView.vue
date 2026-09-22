<script setup lang="ts">
import { ref } from 'vue';
import Form from "../components/form.vue";
import { Sun, Moon } from '@lucide/vue';

const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 min-h-screen bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300 relative">
    <!-- Theme Toggle -->
    <button @click="toggleTheme" class="absolute top-8 right-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2 rounded-full transition-colors z-[100] bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50">
      <Sun v-if="isDarkMode" class="w-5 h-5" />
      <Moon v-else class="w-5 h-5" />
    </button>

    <!-- Left Section: Copywriting -->
    <section class="flex flex-col justify-center gap-6 px-8 pt-32 pb-16 sm:py-16 lg:px-24 relative overflow-hidden">
      <!-- Premium Back Button -->
      <RouterLink to="/welcome" class="absolute top-8 left-8 sm:top-10 sm:left-10 z-50 group flex items-center gap-3 px-2 py-2 pr-5 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/60 dark:border-slate-700/80 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-full w-9 h-9 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </div>
        <span class="font-extrabold text-[14px] text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white tracking-wide">Return</span>
      </RouterLink>

      <!-- Glow effect -->
      <div class="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -ml-20 -mt-20"></div>
      
      <div class="max-w-xl relative z-10">
        <h1 class="text-5xl font-extrabold text-slate-900 dark:text-white sm:text-6xl lg:text-7xl animate-slide-in tracking-tight">
          Request AI<br />
          <span class="text-blue-600 dark:text-blue-400">Automation</span><br />
          Assessment
        </h1>

        <p class="mt-6 max-w-lg text-lg leading-relaxed text-slate-500 dark:text-slate-400 sm:text-xl animate-slide-in delay-100">
          Discover how AI can streamline your workflow. Get a personalized assessment of your automation potential and see the exact ROI you can expect.
        </p>
      </div>
    </section>

    <!-- Right Section: Premium Form Card -->
    <section class="flex items-center justify-center bg-blue-600 px-5 py-12 sm:px-8 lg:px-12 relative overflow-hidden">
      <!-- Decorative Orbs -->
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] pointer-events-none -mt-40 -mr-40"></div>
      <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/30 rounded-full blur-[80px] pointer-events-none -mb-20 -ml-20"></div>

      <div class="bg-white p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 animate-slide-in delay-200">
        <Form type="assessment" />
      </div>
    </section>
  </div>
</template>
