<script setup lang="ts">
import { ref } from 'vue'

// Menerima prop untuk mengetahui menu mana yang sedang aktif
defineProps<{
  activeMenu: string
}>()

const emit = defineEmits(['navigate'])

// State untuk Modal Logout
const isLogoutModalOpen = ref(false)
const openLogoutModal = () => isLogoutModalOpen.value = true
const closeLogoutModal = () => isLogoutModalOpen.value = false
const confirmLogout = () => { closeLogoutModal(); emit('navigate', 'login') }

// Helper untuk class menu aktif/tidak aktif
const getMenuClass = (menuName: string, currentMenu: string) => {
  if (menuName === currentMenu) {
    return 'flex items-center gap-4 pl-[20px] pr-6 py-3 bg-[#D4E3F7] border-l-4 border-[#2563EB] rounded-r-xl transition text-[#2563EB] font-bold'
  }
  return 'flex items-center gap-4 px-6 py-3 border-l-4 border-transparent hover:bg-gray-50 transition rounded-r-xl text-black font-medium'
}
const getIconColor = (menuName: string, currentMenu: string) => {
  return menuName === currentMenu ? 'text-[#2563EB]' : 'text-[#2563EB]' // Ikon selalu biru sesuai desain Anda
}
</script>

<template>
  <div class="flex min-h-screen bg-[#F8FAFC] text-[#1E293B]">
    
    <!-- SIDEBAR GLOBAL -->
    <aside class="w-64 bg-white border-r border-[#E2E8F0] flex flex-col justify-between flex-shrink-0 z-20 relative">
      <div>
        <!-- Logo -->
        <div class="h-16 flex items-center gap-3 px-6 border-b border-[#E2E8F0]">
          <div class="bg-[#2563EB] text-white font-bold text-xs px-2 py-1 rounded">Logo</div>
          <div class="flex flex-col justify-center">
            <span class="font-bold text-[24px] text-[#0F172A] leading-none">Atlas</span>
            <span class="text-[12px] font-extrabold text-[#2563EB] tracking-wider uppercase mt-1 leading-none">BY DDTECH</span>
          </div>
        </div>

        <!-- Menu Navigasi -->
        <nav class="py-6 space-y-3 pr-5">
          <a href="#" @click.prevent="emit('navigate', 'dashboard')" :class="getMenuClass('dashboard', activeMenu)">
            <svg class="w-[24px] h-[24px]" :class="getIconColor('dashboard', activeMenu)" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M14.305 9q-.345 0-.575-.23t-.23-.587V4.817q0-.357.234-.587t.58-.23h4.88q.347 0 .576.23t.23.587v3.366q0 .358-.234.587q-.234.23-.58.23zm-9.5 3q-.345 0-.575-.23T4 11.2V4.8q0-.34.234-.57t.58-.23h4.88q.347 0 .576.23t.23.57v6.4q0 .34-.234.57t-.58.23zm9.5 8q-.345 0-.575-.23t-.23-.57v-6.4q0-.34.234-.57t.58-.23h4.88q.347 0 .576.23t.23.57v6.4q0 .34-.234.57t-.58.23zm-9.5 0q-.345 0-.575-.23T4 19.183v-3.366q0-.357.234-.587t.58-.23h4.88q.347 0 .576.23t.23.587v3.366q0 .358-.234.587q-.234.23-.58.23z" /></svg>
            <span class="text-[16px] tracking-wide">Dashboard</span>
          </a>

          <a href="#" @click.prevent="emit('navigate', 'leads')" :class="getMenuClass('leads', activeMenu)">
            <svg class="w-[26px] h-[26px]" :class="getIconColor('leads', activeMenu)" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            <span class="text-[16px] tracking-wide">Leads</span>
          </a>

          <a href="#" @click.prevent="emit('navigate', 'pipeline')" :class="getMenuClass('pipeline', activeMenu)">
            <svg class="w-[26px] h-[26px]" :class="getIconColor('pipeline', activeMenu)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="9" r="3"/><path d="M6 9v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V12"/></svg>
            <span class="text-[16px] tracking-wide">Pipeline</span>
          </a>

          <a href="#" @click.prevent="emit('navigate', 'settings')" :class="getMenuClass('settings', activeMenu)">
            <svg class="w-[26px] h-[26px]" :class="getIconColor('settings', activeMenu)" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87a.49.49 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
            <span class="text-[16px] tracking-wide">Settings</span>
          </a>
        </nav>
      </div>

      <div class="p-5 border-t border-[#E2E8F0]">
        <button @click="openLogoutModal" class="w-full flex items-center justify-center gap-2.5 bg-[#2563EB] text-white text-[15px] font-bold py-3 rounded-xl shadow-[0_4px_10px_rgba(37,99,235,0.3)] hover:bg-blue-700 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 5 12 10 7" /><line x1="15" y1="12" x2="5" y2="12" /></svg>
          Log Out
        </button>
      </div>
    </aside>

    <!-- AREA KONTEN UTAMA -->
    <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
      
      <!-- TOP HEADER GLOBAL -->
      <header class="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-8 flex-shrink-0 z-10">
        <div class="relative w-80">
          <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Search everywhere..." class="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-full focus:outline-none focus:ring-1 focus:ring-[#2563EB]"/>
        </div>
        
        <div class="flex items-center gap-5">
          <button class="relative text-[#2563EB] hover:text-blue-700 transition">
            <svg class="w-[22px] h-[22px]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            <span class="absolute top-[2px] right-[2px] w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <div class="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div class="text-right">
              <div class="text-xs font-bold text-[#0F172A]">Aldean Tegar</div>
              <div class="text-[10px] text-[#64748B]">Admin</div>
            </div>
            <div class="w-8 h-8 rounded-full bg-[#E0E7FF] text-[#2563EB] font-bold text-xs flex items-center justify-center border border-[#C7D2FE]">AT</div>
          </div>
        </div>
      </header>

      <!-- SLOT TEMPAT KONTEN HALAMAN AKAN DIMASUKKAN -->
      <slot />

    </div>
  </div>

  <!-- MODAL LOGOUT GLOBAL -->
  <div v-if="isLogoutModalOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <div class="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm transition-opacity" @click="closeLogoutModal"></div>
    <div class="relative bg-white shadow-2xl w-full max-w-[450px] pt-12 pb-10 px-8 text-center rounded-[5px]">
      <button @click="closeLogoutModal" class="absolute top-4 right-4 text-[#2563EB] hover:text-blue-800 transition">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      <h2 class="text-[24px] font-bold text-black mb-2 leading-snug tracking-tight">You are attempting to log out of <span class="text-[#2563EB]">Atlas</span></h2>
      <p class="text-[16px] text-gray-500 font-semibold mb-8">Are you sure?</p>
      <div class="flex flex-col gap-3 max-w-[320px] mx-auto">
        <button @click="closeLogoutModal" class="w-full py-2.5 border border-gray-300 bg-white text-black text-[16px] font-bold hover:bg-gray-50 transition rounded-[5px]">Cancel</button>
        <button @click="confirmLogout" class="w-full py-2.5 bg-[#2563EB] text-white text-[16px] font-bold hover:bg-blue-700 transition shadow-sm rounded-[5px]">Sign Out</button>
      </div>
    </div>
  </div>
</template>