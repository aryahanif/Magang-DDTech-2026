<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Menu, X } from '@lucide/vue'
import AtlasLogo from '../assets/atlas-logo.png'

const isMenuOpen = ref(false)
</script>

<template>
  <header class="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center w-[95%] lg:w-max transition-all duration-300">
    
    <!-- Main Pill -->
    <div class="relative z-20 w-full bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl rounded-full border border-white/60 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] px-4 py-3 lg:py-4 lg:pl-5 lg:pr-10 flex justify-between lg:justify-start items-center gap-6 lg:gap-12 transition-colors">
      
      <!-- Inside Left Logo -->
      <RouterLink to="/welcome" class="flex items-center gap-2.5 hover:opacity-80 transition-opacity" @click="isMenuOpen = false">
        <img :src="AtlasLogo" alt="Atlas Logo" class="h-8 w-auto" />
        <span class="text-blue-600 dark:text-blue-400 font-extrabold text-[17px] tracking-wide">Atlas</span>
      </RouterLink>

      <!-- Desktop Links -->
      <nav class="hidden lg:flex items-center gap-10">
        <RouterLink to="/requestdemo" exact-active-class="!text-blue-600 dark:!text-blue-400" class="text-[15px] py-1 font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Request demo</RouterLink>
        <RouterLink to="/assessment" exact-active-class="!text-blue-600 dark:!text-blue-400" class="text-[15px] py-1 font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Assessment</RouterLink>
        <RouterLink to="/contact-sales" exact-active-class="!text-blue-600 dark:!text-blue-400" class="text-[15px] py-1 font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact Sales</RouterLink>
        <RouterLink to="/waitlist" exact-active-class="!text-blue-600 dark:!text-blue-400" class="text-[15px] py-1 font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Waitlist</RouterLink>
        <RouterLink to="/partner-inquiry" exact-active-class="!text-blue-600 dark:!text-blue-400" class="text-[15px] py-1 font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Partner Inquiry</RouterLink>
      </nav>

      <!-- Mobile View Menu Toggle -->
      <div class="lg:hidden flex items-center">
        <button @click="isMenuOpen = !isMenuOpen" class="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300">
          <Menu v-if="!isMenuOpen" class="w-5 h-5" />
          <X v-else class="w-5 h-5" />
        </button>
      </div>

    </div>

    <!-- Mobile Dropdown Menu -->
    <div v-show="isMenuOpen" class="lg:hidden absolute top-[100%] left-0 right-0 mt-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 rounded-2xl shadow-xl p-3 flex flex-col gap-1 z-10 origin-top animate-mask-in">
      <RouterLink to="/requestdemo" exact-active-class="!text-blue-600 dark:!text-blue-400" @click="isMenuOpen = false" class="px-4 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 font-bold text-[15px] text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Request demo</RouterLink>
      <RouterLink to="/assessment" exact-active-class="!text-blue-600 dark:!text-blue-400" @click="isMenuOpen = false" class="px-4 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 font-bold text-[15px] text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Assessment</RouterLink>
      <RouterLink to="/contact-sales" exact-active-class="!text-blue-600 dark:!text-blue-400" @click="isMenuOpen = false" class="px-4 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 font-bold text-[15px] text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact Sales</RouterLink>
      <RouterLink to="/waitlist" exact-active-class="!text-blue-600 dark:!text-blue-400" @click="isMenuOpen = false" class="px-4 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 font-bold text-[15px] text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Waitlist</RouterLink>
      <RouterLink to="/partner-inquiry" exact-active-class="!text-blue-600 dark:!text-blue-400" @click="isMenuOpen = false" class="px-4 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 font-bold text-[15px] text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Partner Inquiry</RouterLink>
    </div>
  </header>
</template>