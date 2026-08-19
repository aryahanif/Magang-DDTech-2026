<script setup lang="ts">
import { ref } from 'vue'
import LoginView from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'
import LeadsView from './views/LeadsView.vue' // Import komponen baru

// State untuk mengatur halaman aktif
const currentView = ref<'login' | 'dashboard' | 'leads'>('login')
</script>

<template>
  <div>
    <LoginView 
      v-if="currentView === 'login'" 
      @login-success="currentView = 'dashboard'" 
    />

    <DashboardView 
      v-else-if="currentView === 'dashboard'" 
      @navigate="(page) => currentView = page" 
    />
    
    <!-- Tambahkan kondisi render untuk Leads -->
    <LeadsView 
      v-else-if="currentView === 'leads'" 
      @navigate="(page) => currentView = page" 
    />
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>