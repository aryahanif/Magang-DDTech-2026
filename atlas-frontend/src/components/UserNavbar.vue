<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

const isMenuOpen = ref(false)
</script>
<template>
<header class="bg-fbg border-b border-gray-200 sticky top-0 z-50">
      <div class="py-4 px-8 flex justify-between items-center">
        <div class="text-2xl font-bold">
          <RouterLink to="/welcome" @click="isMenuOpen = false">Atlas</RouterLink>
        </div>
        
        <!-- Desktop Nav -->
        <nav class="hidden lg:flex gap-6 items-center">
          <RouterLink to="/welcome" class="hover:text-blue-600 transition font-medium">Home</RouterLink>
          <RouterLink to="/assessment" class="hover:text-blue-600 transition font-medium">Assessment</RouterLink>
          <RouterLink to="/contact-sales" class="hover:text-blue-600 transition font-medium">Contact Sales</RouterLink>
          <RouterLink to="/waitlist" class="hover:text-blue-600 transition font-medium">Waitlist</RouterLink>
          <RouterLink to="/partner-inquiry" class="hover:text-blue-600 transition font-medium">Partner Inquiry</RouterLink>
          <RouterLink to="/requestdemo" class="hover:text-blue-600 transition font-medium">Request Demo</RouterLink>
        </nav>

        <!-- Mobile Hamburger Button -->
        <button 
          @click="isMenuOpen = !isMenuOpen" 
          class="lg:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 focus:outline-none"
        >
          <span :class="{'rotate-45 translate-y-2': isMenuOpen}" class="block w-6 h-0.5 bg-gray-800 transition-transform duration-300"></span>
          <span :class="{'opacity-0': isMenuOpen}" class="block w-6 h-0.5 bg-gray-800 transition-opacity duration-300"></span>
          <span :class="{'-rotate-45 -translate-y-2': isMenuOpen}" class="block w-6 h-0.5 bg-gray-800 transition-transform duration-300"></span>
        </button>
      </div>

      <!-- Mobile Nav -->
      <nav 
        v-show="isMenuOpen" 
        class="lg:hidden flex flex-col px-8 pb-4 space-y-3 bg-fbg border-t border-gray-100"
      >
        <RouterLink to="/welcome" @click="isMenuOpen = false" class="hover:text-blue-600 transition font-medium block py-2">Home</RouterLink>
        <RouterLink to="/assessment" @click="isMenuOpen = false" class="hover:text-blue-600 transition font-medium block py-2">Assessment</RouterLink>
        <RouterLink to="/contact-sales" @click="isMenuOpen = false" class="hover:text-blue-600 transition font-medium block py-2">Contact Sales</RouterLink>
        <RouterLink to="/waitlist" @click="isMenuOpen = false" class="hover:text-blue-600 transition font-medium block py-2">Waitlist</RouterLink>
        <RouterLink to="/partner-inquiry" @click="isMenuOpen = false" class="hover:text-blue-600 transition font-medium block py-2">Partner Inquiry</RouterLink>
        <RouterLink to="/requestdemo" @click="isMenuOpen = false" class="hover:text-blue-600 transition font-medium block py-2">Request Demo</RouterLink>
      </nav>
    </header>
</template>