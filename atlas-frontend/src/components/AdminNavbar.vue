<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="bg-gray-900 text-white border-b border-gray-700 sticky top-0 z-50">
    <div class="py-4 px-8 flex justify-between items-center">
      <div class="text-2xl font-bold text-blue-400">
        <RouterLink to="/admin/dashboard">Atlas Admin</RouterLink>
      </div>
      
      <nav class="flex gap-6 items-center">
        <RouterLink to="/admin/dashboard" class="hover:text-blue-300 transition" active-class="text-blue-400 font-bold">Dashboard</RouterLink>
        <RouterLink to="/admin/leads" class="hover:text-blue-300 transition" active-class="text-blue-400 font-bold">Leads</RouterLink>
        <RouterLink to="/admin/pipeline" class="hover:text-blue-300 transition" active-class="text-blue-400 font-bold">Pipeline</RouterLink>
        <RouterLink to="/admin/settings" class="hover:text-blue-300 transition" active-class="text-blue-400 font-bold">Settings</RouterLink>
        
        <div class="border-l border-gray-600 pl-6 ml-2">
          <RouterLink to="/admin/login" class="text-sm bg-gray-800 px-4 py-2 rounded hover:bg-gray-700 transition">Logout</RouterLink>
        </div>
      </nav>
    </div>
  </header>
</template>
