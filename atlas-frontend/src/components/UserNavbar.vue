<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Menu, X } from '@lucide/vue'

const isMenuOpen = ref(false)
</script>

<template>
  <header class="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center w-[95%] lg:w-max transition-all duration-300">
    
    <!-- Main Pill -->
    <div class="relative z-20 w-full bg-white/70 backdrop-blur-xl rounded-full border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-4 py-3 lg:py-4 lg:pl-5 lg:pr-10 flex justify-between lg:justify-start items-center gap-6 lg:gap-12">
      
      <!-- Inside Left Logo -->
      <RouterLink to="/welcome" class="flex items-center gap-2.5 hover:opacity-80 transition-opacity" @click="isMenuOpen = false">
        <div class="bg-blue-600 text-white rounded-lg w-8 h-8 flex items-center justify-center font-bold text-lg shadow-sm leading-none">
          A
        </div>
        <span class="text-blue-600 font-extrabold text-[17px] tracking-wide">Atlas</span>
      </RouterLink>

      <!-- Desktop Links -->
      <nav class="hidden lg:flex items-center gap-10">
        <RouterLink to="/requestdemo" exact-active-class="!text-blue-600" class="text-[15px] py-1 font-semibold text-slate-600 hover:text-blue-600 transition-colors">Request demo</RouterLink>
        <RouterLink to="/assessment" exact-active-class="!text-blue-600" class="text-[15px] py-1 font-semibold text-slate-600 hover:text-blue-600 transition-colors">Assessment</RouterLink>
        <RouterLink to="/contact-sales" exact-active-class="!text-blue-600" class="text-[15px] py-1 font-semibold text-slate-600 hover:text-blue-600 transition-colors">Contact Sales</RouterLink>
        <RouterLink to="/waitlist" exact-active-class="!text-blue-600" class="text-[15px] py-1 font-semibold text-slate-600 hover:text-blue-600 transition-colors">Waitlist</RouterLink>
        <RouterLink to="/partner-inquiry" exact-active-class="!text-blue-600" class="text-[15px] py-1 font-semibold text-slate-600 hover:text-blue-600 transition-colors">Partner Inquiry</RouterLink>
      </nav>

      <!-- Mobile View Menu Toggle -->
      <div class="lg:hidden flex items-center">
        <button @click="isMenuOpen = !isMenuOpen" class="w-8 h-8 flex items-center justify-center text-slate-600">
          <Menu v-if="!isMenuOpen" class="w-5 h-5" />
          <X v-else class="w-5 h-5" />
        </button>
      </div>

    </div>

    <!-- Mobile Dropdown Menu -->
    <div v-show="isMenuOpen" class="lg:hidden absolute top-[100%] left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl p-3 flex flex-col gap-1 z-10 origin-top animate-mask-in">
      <RouterLink to="/requestdemo" exact-active-class="!text-blue-600" @click="isMenuOpen = false" class="px-4 py-3 rounded-xl hover:bg-blue-50 font-bold text-[15px] text-slate-700 hover:text-blue-600 transition-colors">Request demo</RouterLink>
      <RouterLink to="/assessment" exact-active-class="!text-blue-600" @click="isMenuOpen = false" class="px-4 py-3 rounded-xl hover:bg-blue-50 font-bold text-[15px] text-slate-700 hover:text-blue-600 transition-colors">Assessment</RouterLink>
      <RouterLink to="/contact-sales" exact-active-class="!text-blue-600" @click="isMenuOpen = false" class="px-4 py-3 rounded-xl hover:bg-blue-50 font-bold text-[15px] text-slate-700 hover:text-blue-600 transition-colors">Contact Sales</RouterLink>
      <RouterLink to="/waitlist" exact-active-class="!text-blue-600" @click="isMenuOpen = false" class="px-4 py-3 rounded-xl hover:bg-blue-50 font-bold text-[15px] text-slate-700 hover:text-blue-600 transition-colors">Waitlist</RouterLink>
      <RouterLink to="/partner-inquiry" exact-active-class="!text-blue-600" @click="isMenuOpen = false" class="px-4 py-3 rounded-xl hover:bg-blue-50 font-bold text-[15px] text-slate-700 hover:text-blue-600 transition-colors">Partner Inquiry</RouterLink>
    </div>
  </header>
</template>