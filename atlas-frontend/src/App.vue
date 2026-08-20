<script setup lang="ts">
import { ref } from 'vue'
import LoginView from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'
import LeadsView from './views/LeadsView.vue'
import PipelineView from './views/PipelineView.vue'
import SettingsView from './views/SettingsView.vue'

// PERBAIKAN: Tambahkan 'pipeline' dan 'settings' ke dalam tipe data yang diizinkan
const currentView = ref<'login' | 'dashboard' | 'leads' | 'pipeline' | 'settings'>('login')
</script>

<template>
  <div>
    <LoginView 
      v-if="currentView === 'login'" 
      @login-success="currentView = 'dashboard'" 
    />

    <DashboardView 
      v-else-if="currentView === 'dashboard'" 
      @navigate="(page: any) => currentView = page" 
    />
    
    <LeadsView 
      v-else-if="currentView === 'leads'" 
      @navigate="(page: any) => currentView = page" 
    />
    
    <PipelineView 
      v-else-if="currentView === 'pipeline'" 
      @navigate="(page: any) => currentView = page"
    />

    <SettingsView 
      v-else-if="currentView === 'settings'" 
      @navigate="(page: any) => currentView = page"
    />
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>