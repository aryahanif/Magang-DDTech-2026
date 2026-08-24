<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'

defineProps<{
  activeMenu: string
}>()

const router = useRouter()

// ==========================================
// STATE UNTUK NOTIFIKASI & DRAWER
// ==========================================
const isNotificationOpen = ref(false)
const isNotificationDrawerOpen = ref(false) // State untuk panel laci (drawer) kanan

// Data Dummy Notifikasi (Diperbanyak untuk demo panel laci)
const notifications = ref([
  { id: 1, title: 'New Lead Assigned', message: 'Sarah Whitfield has been assigned to you by System.', time: '5m ago', unread: true, icon: 'user' },
  { id: 2, title: 'AI Qualification Complete', message: 'Kowhai Health scored 92 (Tier A). Ready for review.', time: '1h ago', unread: true, icon: 'sparkles' },
  { id: 3, title: 'Demo Reminder', message: 'Upcoming demo with Pacific Brokerage in 15 mins.', time: '2h ago', unread: false, icon: 'calendar' },
  { id: 4, title: 'Weekly Report Ready', message: 'Your AI workforce generated 634 new leads this week.', time: '1d ago', unread: false, icon: 'sparkles' },
  { id: 5, title: 'Deal Won!', message: 'Bandung Textiles has signed the proposal. Value: $110k.', time: '2d ago', unread: false, icon: 'user' },
  { id: 6, title: 'System Update', message: 'Atlas CRM has been updated to version 2.4.1.', time: '3d ago', unread: false, icon: 'calendar' }
])

const unreadCount = computed(() => notifications.value.filter(n => n.unread).length)

// Hanya ambil 3 notifikasi terbaru untuk Dropdown kecil
const recentNotifications = computed(() => notifications.value.slice(0, 3))

const toggleNotification = () => isNotificationOpen.value = !isNotificationOpen.value
const closeNotification = () => isNotificationOpen.value = false

const markAllAsRead = () => notifications.value.forEach(n => n.unread = false)
const markAsRead = (id: number) => {
  const notif = notifications.value.find(n => n.id === id)
  if (notif) notif.unread = false
}

// FUNGSI BARU: Buka Drawer Semua Notifikasi
const openNotificationDrawer = () => {
  isNotificationOpen.value = false // Tutup dropdown kecil
  isNotificationDrawerOpen.value = true // Buka laci besar
}

const closeNotificationDrawer = () => {
  isNotificationDrawerOpen.value = false
}

// ==========================================
// STATE UNTUK USER POPOVER MENU
// ==========================================
const isUserMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

const toggleUserMenu = (event: Event) => {
  event.stopPropagation() 
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (isUserMenuOpen.value && userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    isUserMenuOpen.value = false
  }
}

// ==========================================
// STATE UNTUK MODAL LOGOUT & MOBILE MENU
// ==========================================
const isLogoutModalOpen = ref(false)
const openLogoutModal = () => isLogoutModalOpen.value = true
const closeLogoutModal = () => isLogoutModalOpen.value = false
const confirmLogout = () => { closeLogoutModal(); router.push('/admin') }

const isMobileMenuOpen = ref(false)
const toggleMobileMenu = () => isMobileMenuOpen.value = !isMobileMenuOpen.value
const closeMobileMenu = () => isMobileMenuOpen.value = false

// ==========================================
// STATE UNTUK DESKTOP SIDEBAR (HOVER & PIN)
// ==========================================
const isSidebarCollapsed = ref(false) 
const isSidebarHovered = ref(false)   

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  const savedState = localStorage.getItem('atlas_sidebar_collapsed')
  if (savedState === 'true') {
    isSidebarCollapsed.value = true
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  localStorage.setItem('atlas_sidebar_collapsed', String(isSidebarCollapsed.value))
}

const isVisuallyWide = computed(() => !isSidebarCollapsed.value || isSidebarHovered.value)

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
         TOP HEADER GLOBAL
         ======================================= -->
    <header class="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E2E8F0] flex items-center px-4 lg:px-6 z-50">
      
      <!-- BAGIAN KIRI: Hamburger & Logo -->
      <div class="flex items-center gap-4 lg:gap-5 flex-shrink-0">
        <button @click="toggleSidebar" class="hidden lg:flex p-1.5 -ml-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        
        <button @click="toggleMobileMenu" class="lg:hidden p-1.5 -ml-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors focus:outline-none">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>

        <div class="flex items-center gap-3 overflow-hidden whitespace-nowrap cursor-default w-[140px] lg:w-[180px]">
          <div class="bg-[#2563EB] text-white font-bold text-xs px-2 py-1 rounded">Logo</div>
          <div class="flex flex-col justify-center">
            <span class="font-bold text-[22px] text-[#0F172A] leading-none">Atlas</span>
            <span class="text-[10px] font-extrabold text-[#2563EB] tracking-wider uppercase mt-1 leading-none">BY DDTECH</span>
          </div>
        </div>
      </div>

      <!-- BAGIAN TENGAH: Search Area -->
      <div class="relative w-full max-w-[600px] hidden sm:block ml-2 lg:ml-8 transition-all">
        <svg class="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input type="text" placeholder="Search everywhere..." class="w-full pl-12 pr-4 py-2.5 text-[14px] bg-[#F1F5F9] hover:bg-[#E2E8F0] focus:bg-white border border-transparent focus:border-[#2563EB] rounded-lg transition-colors focus:outline-none focus:shadow-[0_0_0_4px_rgba(37,99,235,0.1)]"/>
      </div>
      
      <!-- BAGIAN KANAN: Notifikasi & Logout -->
      <div class="flex items-center gap-3 sm:gap-5 flex-shrink-0 ml-auto">
        
        <!-- DROPDOWN NOTIFIKASI -->
        <div class="relative">
          <div v-if="isNotificationOpen" @click="closeNotification" class="fixed inset-0 z-[55]"></div>

          <button @click="toggleNotification" class="relative text-[#64748B] hover:text-[#0F172A] hover:bg-gray-100 p-2 rounded-full transition z-[60]">
            <svg class="w-[22px] h-[22px]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            <span v-if="unreadCount > 0" class="absolute top-[3px] right-[4px] w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          <!-- Kotak Dropdown Notifikasi Cepat -->
          <div v-if="isNotificationOpen" class="absolute right-0 mt-3 w-80 bg-white border border-[#E2E8F0] shadow-2xl rounded-xl z-[70] overflow-hidden animate-fade-in origin-top-right">
            <div class="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <h3 class="text-[14px] font-bold text-[#0F172A]">Recent</h3>
              <button v-if="unreadCount > 0" @click="markAllAsRead" class="text-[11px] font-bold text-[#2563EB] hover:underline">
                Mark all as read
              </button>
            </div>
            
            <div class="max-h-[320px] overflow-y-auto">
              <div v-if="recentNotifications.length === 0" class="p-6 text-center text-[12px] text-gray-500">
                Tidak ada notifikasi saat ini.
              </div>
              <div v-for="notif in recentNotifications" :key="notif.id" @click="markAsRead(notif.id)" :class="['p-4 border-b border-gray-100 cursor-pointer transition hover:bg-gray-50 flex gap-3', notif.unread ? 'bg-[#EFF6FF]' : 'bg-white']">
                <div class="mt-0.5">
                  <div v-if="notif.icon === 'user'" class="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
                  <div v-else-if="notif.icon === 'sparkles'" class="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
                  <div v-else class="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                </div>
                <div class="flex-1">
                  <div class="flex justify-between items-start mb-0.5">
                    <h4 class="text-[13px] font-bold" :class="notif.unread ? 'text-[#0F172A]' : 'text-[#475569]'">{{ notif.title }}</h4>
                    <span v-if="notif.unread" class="w-1.5 h-1.5 bg-[#2563EB] rounded-full mt-1.5"></span>
                  </div>
                  <p class="text-[12px] text-[#64748B] leading-snug mb-1.5">{{ notif.message }}</p>
                  <span class="text-[10px] font-medium text-[#94A3B8]">{{ notif.time }}</span>
                </div>
              </div>
            </div>
            
            <!-- Tombol View All -->
            <div class="p-3 bg-gray-50 border-t border-[#E2E8F0] text-center">
              <button @click="openNotificationDrawer" class="text-[12px] font-bold text-[#64748B] hover:text-[#0F172A] transition-colors">
                View all notifications
              </button>
            </div>
          </div>
        </div>

        <div class="hidden sm:block w-px h-6 bg-[#E2E8F0] mx-1"></div>

        <!-- TOMBOL LOGOUT -->
        <button @click="openLogoutModal" class="flex items-center gap-2 text-[#64748B] hover:text-red-600 font-semibold text-[13px] bg-white border border-[#E2E8F0] hover:border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 5 12 10 7" /><line x1="15" y1="12" x2="5" y2="12" /></svg>
          <span class="hidden sm:block">Log Out</span>
        </button>

      </div>
    </header>

    <!-- =======================================
         KONTROL BAWAH (SIDEBAR & KONTEN)
         ======================================= -->
    <div class="flex w-full h-[calc(100vh-4rem)] mt-16 relative">
      
      <div v-if="isMobileMenuOpen" @click="closeMobileMenu" class="fixed inset-0 top-16 bg-[#0F172A]/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"></div>

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
        <nav class="py-6 flex flex-col transition-all duration-300 flex-1 overflow-y-auto" :class="isVisuallyWide ? 'pr-5' : 'lg:px-3'">
          <div class="mb-3 flex items-center h-5 overflow-hidden transition-all" :class="isVisuallyWide ? 'px-5' : 'lg:justify-center'">
            <span v-if="isVisuallyWide" class="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider whitespace-nowrap">Main Menu</span>
            <span v-else class="text-[#94A3B8] font-bold text-[14px] hidden lg:block leading-none -mt-1">•••</span>
          </div>

          <div class="space-y-2">
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
          </div>

          <div class="mt-8 border-t border-[#F1F5F9] pt-4 transition-colors">
            <RouterLink to="/admin/settings" title="Settings" :class="[getMenuClass('settings', activeMenu), isVisuallyWide ? 'pl-[20px] pr-6' : 'lg:justify-center lg:px-0']" @click="closeMobileMenu">
              <svg class="w-[26px] h-[26px] flex-shrink-0" :class="getIconColor('settings', activeMenu)" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87a.49.49 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
              <span class="text-[16px] tracking-wide whitespace-nowrap" :class="isVisuallyWide ? 'block' : 'lg:hidden'">Settings</span>
            </RouterLink>
          </div>
        </nav>

        <!-- USER PROFILE POPOVER AREA -->
        <div class="relative transition-all duration-300" :class="[isVisuallyWide ? 'p-4' : 'lg:p-3 p-4', isSidebarCollapsed && isSidebarHovered ? 'border-t border-gray-100' : 'border-t border-[#E2E8F0]']">
          <div ref="userMenuRef">
            <div v-if="isUserMenuOpen" class="absolute bottom-full left-4 mb-2 w-52 bg-white border border-[#E2E8F0] shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-xl z-50 overflow-hidden animate-fade-in origin-bottom-left transition-colors">
              <div class="px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <p class="text-[13px] font-bold text-[#0F172A] truncate">Aldean Tegar</p>
                <p class="text-[11px] text-[#64748B] truncate">aldean@atlas.ai</p>
              </div>
              <div class="p-1.5">
                <RouterLink to="/admin/settings" @click="isUserMenuOpen = false" class="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-[#475569] hover:bg-blue-50 hover:text-[#2563EB] rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  My Profile
                </RouterLink>
                <div class="my-1 border-t border-gray-100"></div>
                <button @click="isUserMenuOpen = false" class="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-[#475569] hover:bg-blue-50 hover:text-[#2563EB] rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Help & Support
                </button>
              </div>
            </div>

            <div @click="toggleUserMenu" class="flex items-center gap-3 hover:bg-gray-50 p-2 -m-2 rounded-xl transition-colors cursor-pointer" :class="isVisuallyWide ? '' : 'lg:justify-center'">
              <div class="w-[40px] h-[40px] rounded-xl bg-[#EFF6FF] text-[#2563EB] font-bold text-[14px] flex items-center justify-center border border-[#BFDBFE] flex-shrink-0 shadow-sm transition-colors">
                AT
              </div>
              <div class="flex flex-col truncate" :class="isVisuallyWide ? 'block' : 'lg:hidden'">
                <span class="text-[14px] font-bold text-[#0F172A] leading-tight truncate transition-colors">Aldean Tegar</span>
                <span class="text-[12px] font-medium text-[#64748B] truncate transition-colors">Super Admin</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- AREA KONTEN UTAMA -->
      <div class="flex-1 flex flex-col min-w-0 h-[calc(100vh-4rem)] overflow-hidden relative transition-all duration-300 ease-in-out" :class="isSidebarCollapsed ? 'lg:ml-[84px]' : 'lg:ml-64'">
        <slot />
      </div>

    </div>
  </div>

  <!-- =======================================
       SLIDE-OVER DRAWER (SEMUA NOTIFIKASI)
       ======================================= -->
  <div v-if="isNotificationDrawerOpen" class="fixed inset-0 z-[90] flex justify-end">
    <!-- Overlay Transparan -->
    <div 
      class="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm transition-opacity" 
      @click="closeNotificationDrawer"
    ></div>

    <!-- Panel Drawer -->
    <div 
      class="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
      :class="isNotificationDrawerOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <!-- Header Drawer -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]">
        <h2 class="text-[18px] font-bold text-[#0F172A]">All Notifications</h2>
        <div class="flex items-center gap-3">
          <button v-if="unreadCount > 0" @click="markAllAsRead" class="text-[12px] font-bold text-[#2563EB] hover:underline">
            Mark all as read
          </button>
          <button @click="closeNotificationDrawer" class="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <!-- Konten Daftar Notifikasi Penuh -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="notifications.length === 0" class="p-8 text-center flex flex-col items-center">
          <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </div>
          <p class="text-[14px] font-bold text-gray-700">You're all caught up!</p>
          <p class="text-[13px] text-gray-500 mt-1">Belum ada notifikasi baru untuk Anda.</p>
        </div>
        
        <div 
          v-for="notif in notifications" 
          :key="notif.id"
          @click="markAsRead(notif.id)"
          :class="['p-5 border-b border-gray-100 cursor-pointer transition hover:bg-gray-50 flex gap-4', notif.unread ? 'bg-[#EFF6FF]' : 'bg-white']"
        >
          <div class="mt-1">
            <div v-if="notif.icon === 'user'" class="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
            <div v-else-if="notif.icon === 'sparkles'" class="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
            <div v-else class="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-start mb-1">
              <h4 class="text-[14px] font-bold" :class="notif.unread ? 'text-[#0F172A]' : 'text-[#475569]'">{{ notif.title }}</h4>
              <span class="text-[11px] font-semibold text-[#94A3B8]">{{ notif.time }}</span>
            </div>
            <p class="text-[13px] text-[#64748B] leading-relaxed mb-2">{{ notif.message }}</p>
            <!-- Badge jika belum dibaca -->
            <span v-if="notif.unread" class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#2563EB] text-white">New</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL LOGOUT GLOBAL -->
  <div v-if="isLogoutModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm transition-opacity" @click="closeLogoutModal"></div>
    <div class="relative bg-white shadow-2xl w-full max-w-[450px] pt-12 pb-10 px-8 text-center rounded-[5px] transition-colors border border-transparent">
      <button @click="closeLogoutModal" class="absolute top-4 right-4 text-[#2563EB] hover:text-blue-800 transition">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      <h2 class="text-[24px] font-bold text-black mb-2 leading-snug tracking-tight transition-colors">You are attempting to log out of <span class="text-[#2563EB]">Atlas</span></h2>
      <p class="text-[16px] text-gray-500 font-semibold mb-8 transition-colors">Are you sure?</p>
      <div class="flex flex-col gap-3 max-w-[320px] mx-auto">
        <button @click="closeLogoutModal" class="w-full py-2.5 border border-gray-300 bg-white text-black text-[16px] font-bold hover:bg-gray-50 transition rounded-[5px]">Cancel</button>
        <button @click="confirmLogout" class="w-full py-2.5 bg-[#2563EB] text-white text-[16px] font-bold hover:bg-blue-700 transition shadow-sm rounded-[5px]">Sign Out</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95) translateY(-5px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>