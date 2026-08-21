<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'

// Menerima prop untuk mengetahui menu mana yang sedang aktif
defineProps<{
  activeMenu: string
}>()

const router = useRouter()

// State untuk Modal Logout
const isLogoutModalOpen = ref(false)
const openLogoutModal = () => isLogoutModalOpen.value = true
const closeLogoutModal = () => isLogoutModalOpen.value = false
const confirmLogout = () => { closeLogoutModal(); router.push('/admin') }

// State untuk Sidebar Mobile
const isMobileMenuOpen = ref(false)
const toggleMobileMenu = () => isMobileMenuOpen.value = !isMobileMenuOpen.value
const closeMobileMenu = () => isMobileMenuOpen.value = false

// ==========================================
// STATE UNTUK DESKTOP SIDEBAR (HOVER & PIN)
// ==========================================
const isSidebarCollapsed = ref(false) 
const isSidebarHovered = ref(false)   

onMounted(() => {
  const savedState = localStorage.getItem('atlas_sidebar_collapsed')
  if (savedState === 'true') {
    isSidebarCollapsed.value = true
  }
})

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  localStorage.setItem('atlas_sidebar_collapsed', String(isSidebarCollapsed.value))
}

const isVisuallyWide = computed(() => {
  return !isSidebarCollapsed.value || isSidebarHovered.value
})

const getMenuClass = (menuName: string, currentMenu: string) => {
  const activeClass = menuName === currentMenu 
    ? 'bg-[#D4E3F7] border-[#2563EB] text-[#2563EB] font-bold' 
    : 'border-transparent hover:bg-gray-50 text-black font-medium'
    
  return `flex items-center gap-4 py-3 border-l-4 rounded-r-xl transition-colors ${activeClass}`
}

const getIconColor = (menuName: string, currentMenu: string) => {
  return menuName === currentMenu ? 'text-[#2563EB]' : 'text-[#2563EB]'
}
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col">
    
    <!-- =======================================
         TOP HEADER GLOBAL (FULL WIDTH & FIXED)
         ======================================= -->
    <header class="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E2E8F0] flex items-center px-4 lg:px-6 z-50">
      
      <!-- BAGIAN KIRI: Hamburger & Logo -->
      <div class="flex items-center gap-4 lg:gap-5 flex-shrink-0">
        <!-- Tombol Hamburger Desktop -->
        <button @click="toggleSidebar" class="hidden lg:flex p-1.5 -ml-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        
        <!-- Tombol Hamburger Mobile -->
        <button @click="toggleMobileMenu" class="lg:hidden p-1.5 -ml-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors focus:outline-none">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>

        <!-- Logo & Teks Atlas (Diberi fix width agar saat hover, jarak search bar tidak goyang) -->
        <div class="flex items-center gap-3 overflow-hidden whitespace-nowrap cursor-default w-[140px] lg:w-[180px]">
          <div class="bg-[#2563EB] text-white font-bold text-xs px-2 py-1 rounded">Logo</div>
          <div class="flex flex-col justify-center">
            <span class="font-bold text-[22px] text-[#0F172A] leading-none">Atlas</span>
            <span class="text-[10px] font-extrabold text-[#2563EB] tracking-wider uppercase mt-1 leading-none">BY DDTECH</span>
          </div>
        </div>
      </div>

      <!-- BAGIAN TENGAH: Search Area (Lebih dekat ke kiri & Ala Google Workspace) -->
      <div class="relative w-full max-w-[600px] hidden sm:block ml-2 lg:ml-8 transition-all">
        <svg class="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input type="text" placeholder="Search everywhere..." class="w-full pl-12 pr-4 py-2.5 text-[14px] bg-[#F1F5F9] hover:bg-[#E2E8F0] focus:bg-white border border-transparent focus:border-[#2563EB] rounded-lg transition-colors focus:outline-none focus:shadow-[0_0_0_4px_rgba(37,99,235,0.1)]"/>
      </div>
      
      <!-- BAGIAN KANAN: User Profile (Ditambahkan ml-auto untuk dorong ke pojok kanan) -->
      <div class="flex items-center gap-3 sm:gap-5 flex-shrink-0 ml-auto">
        <button class="relative text-[#64748B] hover:text-[#0F172A] hover:bg-gray-100 p-2 rounded-full transition hidden sm:block">
          <svg class="w-[22px] h-[22px]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          <span class="absolute top-[3px] right-[4px] w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        <div class="flex items-center gap-3 pl-0 sm:pl-3 sm:border-l border-gray-200">
          <div class="text-right hidden sm:block">
            <div class="text-[13px] font-bold text-[#0F172A] leading-tight">Aldean Tegar</div>
            <div class="text-[11px] text-[#64748B]">Admin</div>
          </div>
          <div class="w-8 h-8 rounded-full bg-[#E0E7FF] text-[#2563EB] font-bold text-xs flex items-center justify-center border border-[#C7D2FE] cursor-pointer hover:ring-2 ring-offset-1 ring-blue-500 transition-all">AT</div>
        </div>
      </div>
    </header>

    <!-- =======================================
         KONTROL BAWAH (SIDEBAR & KONTEN)
         ======================================= -->
    <div class="flex w-full h-[calc(100vh-4rem)] mt-16 relative">
      
      <!-- OVERLAY UNTUK MOBILE SIDEBAR -->
      <div 
        v-if="isMobileMenuOpen" 
        @click="closeMobileMenu" 
        class="fixed inset-0 top-16 bg-[#0F172A]/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
      ></div>

      <!-- SIDEBAR (FIXED DI BAWAH HEADER) -->
      <aside 
        @mouseenter="isSidebarHovered = true"
        @mouseleave="isSidebarHovered = false"
        :class="[
          'bg-white flex flex-col justify-between z-40 fixed top-16 bottom-0 left-0 transform transition-all duration-300 ease-in-out',
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl w-64' : '-translate-x-full lg:translate-x-0',
          !isMobileMenuOpen && isVisuallyWide ? 'lg:w-64' : '',
          !isMobileMenuOpen && !isVisuallyWide ? 'lg:w-[84px]' : '',
          isSidebarCollapsed && isSidebarHovered ? 'lg:shadow-[4px_0_24px_rgba(0,0,0,0.06)] lg:border-transparent' : 'border-r border-[#E2E8F0]'
        ]"
      >
        <!-- Menu Navigasi (Mulai langsung dari Dashboard) -->
        <nav class="py-6 space-y-3 transition-all duration-300" :class="isVisuallyWide ? 'pr-5' : 'lg:px-3'">
          
          <RouterLink to="/admin/dashboard" title="Dashboard" :class="[getMenuClass('dashboard', activeMenu), isVisuallyWide ? 'pl-[20px] pr-6' : 'lg:justify-center lg:px-0']" @click="closeMobileMenu">
            <svg class="w-[24px] h-[24px] flex-shrink-0" :class="getIconColor('dashboard', activeMenu)" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M14.305 9q-.345 0-.575-.23t-.23-.587V4.817q0-.357.234-.587t.58-.23h4.88q.347 0 .576.23t.23.587v3.366q0 .358-.234.587q-.234.23-.58.23zm-9.5 3q-.345 0-.575-.23T4 11.2V4.8q0-.34.234-.57t.58-.23h4.88q.347 0 .576.23t.23.57v6.4q0 .34-.234.57t-.58.23zm9.5 8q-.345 0-.575-.23t-.23-.57v-6.4q0-.34.234-.57t.58-.23h4.88q.347 0 .576.23t.23.57v6.4q0 .34-.234.57t-.58.23zm-9.5 0q-.345 0-.575-.23T4 19.183v-3.366q0-.357.234-.587t.58-.23h4.88q.347 0 .576.23t.23.587v3.366q0 .358-.234.587q-.234.23-.58.23z" /></svg>
            <span class="text-[16px] tracking-wide whitespace-nowrap" :class="isVisuallyWide ? 'block' : 'lg:hidden'">Dashboard</span>
          </RouterLink>

          <RouterLink to="/admin/leads" title="Leads" :class="[getMenuClass('leads', activeMenu), isVisuallyWide ? 'pl-[20px] pr-6' : 'lg:justify-center lg:px-0']" @click="closeMobileMenu">
            <svg class="w-[26px] h-[26px] flex-shrink-0" :class="getIconColor('leads', activeMenu)" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            <span class="text-[16px] tracking-wide whitespace-nowrap" :class="isVisuallyWide ? 'block' : 'lg:hidden'">Leads</span>
          </RouterLink>

          <RouterLink to="/admin/pipeline" title="Pipeline" :class="[getMenuClass('pipeline', activeMenu), isVisuallyWide ? 'pl-[20px] pr-6' : 'lg:justify-center lg:px-0']" @click="closeMobileMenu">
            <svg class="w-[26px] h-[26px] flex-shrink-0" :class="getIconColor('pipeline', activeMenu)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="9" r="3"/><path d="M6 9v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V12"/></svg>
            <span class="text-[16px] tracking-wide whitespace-nowrap" :class="isVisuallyWide ? 'block' : 'lg:hidden'">Pipeline</span>
          </RouterLink>

          <RouterLink to="/admin/settings" title="Settings" :class="[getMenuClass('settings', activeMenu), isVisuallyWide ? 'pl-[20px] pr-6' : 'lg:justify-center lg:px-0']" @click="closeMobileMenu">
            <svg class="w-[26px] h-[26px] flex-shrink-0" :class="getIconColor('settings', activeMenu)" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87a.49.49 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
            <span class="text-[16px] tracking-wide whitespace-nowrap" :class="isVisuallyWide ? 'block' : 'lg:hidden'">Settings</span>
          </RouterLink>
        </nav>

        <!-- Logout Button Area -->
        <div class="transition-all duration-300" :class="[isVisuallyWide ? 'p-5' : 'lg:p-3 p-5', isSidebarCollapsed && isSidebarHovered ? 'border-t border-gray-100' : 'border-t border-[#E2E8F0]']">
          <button @click="openLogoutModal" title="Log Out" class="w-full flex items-center justify-center gap-2.5 bg-[#2563EB] text-white font-bold py-3 rounded-xl shadow-[0_4px_10px_rgba(37,99,235,0.3)] hover:bg-blue-700 transition-colors" :class="isVisuallyWide ? 'px-4' : 'lg:px-0'">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 5 12 10 7" /><line x1="15" y1="12" x2="5" y2="12" /></svg>
            <span class="text-[15px] whitespace-nowrap" :class="isVisuallyWide ? 'block' : 'lg:hidden'">Log Out</span>
          </button>
        </div>
      </aside>

      <!-- AREA KONTEN UTAMA -->
      <div 
        class="flex-1 flex flex-col min-w-0 h-[calc(100vh-4rem)] overflow-hidden relative transition-all duration-300 ease-in-out"
        :class="isSidebarCollapsed ? 'lg:ml-[84px]' : 'lg:ml-64'"
      >
        <!-- SLOT TEMPAT KONTEN HALAMAN -->
        <slot />
      </div>

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