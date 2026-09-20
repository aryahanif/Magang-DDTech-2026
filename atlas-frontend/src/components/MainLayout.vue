<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import ToastNotification from './ToastNotification.vue'
import { 
  LayoutDashboard, Users, KanbanSquare, CheckSquare, Settings, 
  Menu, X, Bell, User, Sparkles, LogOut, ChevronDown, LifeBuoy, Sun, Moon
} from '@lucide/vue'

defineProps<{
  activeMenu: string
}>()

const router = useRouter()


// STATE UNTUK NOTIFIKASI & DRAWER

const isNotificationOpen = ref(false)
const isNotificationDrawerOpen = ref(false) // State untuk panel laci (drawer) kanan

// TODO: API Fetch Notifikasi

const notifications = ref<any[]>([
  {
    id: 1,
    title: 'New Lead: Jhon Smith',
    message: 'Jhon Smith dari TechCorp baru saja mengisi form Assessment.',
    time: '2 mins ago',
    icon: 'user',
    unread: true
  },
  {
    id: 2,
    title: 'AI Scoring Complete',
    message: 'Data Jhon Smith telah dikualifikasi AI dengan skor 4/5.',
    time: '1 min ago',
    icon: 'sparkles',
    unread: true
  }
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


const openNotificationDrawer = () => {
  isNotificationOpen.value = false
  isNotificationDrawerOpen.value = true
}

const closeNotificationDrawer = () => {
  isNotificationDrawerOpen.value = false
}

const isUserMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)
const currentUser = ref<any>({ name: 'User', email: '', role: 'Admin', initials: 'U' })

const toggleUserMenu = (event: Event) => {
  event.stopPropagation() 
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (isUserMenuOpen.value && userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    isUserMenuOpen.value = false
  }
}

const isLogoutModalOpen = ref(false)

const isSidebarCollapsed = ref(false) 
const isSidebarHovered = ref(false)   

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // Load user data from localStorage
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      const parsed = JSON.parse(userData)
      const userName = parsed.name || 'User';
      const nameParts = userName.trim().split(' ');
      let initials = 'U';
      if (nameParts.length >= 2) {
        initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
      } else if (nameParts.length === 1 && nameParts[0].length >= 2) {
        initials = nameParts[0].substring(0, 2).toUpperCase();
      } else if (nameParts.length === 1 && nameParts[0].length === 1) {
        initials = nameParts[0].toUpperCase();
      }

      currentUser.value = {
        name: userName,
        email: parsed.email || '',
        role: parsed.role || 'Admin',
        initials: initials
      }
    } catch (e) {
      console.error('Failed to parse user data from localStorage')
    }
  }

  // Dark Mode Initialization
  if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  const savedState = localStorage.getItem('atlas_sidebar_collapsed')
  if (savedState === 'true') {
    isSidebarCollapsed.value = true
  }
})

const isDarkMode = ref(false)
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// LOGOUT
const openLogoutModal = () => {
  isLogoutModalOpen.value = true
}
const closeLogoutModal = () => isLogoutModalOpen.value = false
const confirmLogout = () => { 
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user')
  closeLogoutModal()
  router.push('/admin') 
}

const isMobileMenuOpen = ref(false)
const toggleMobileMenu = () => isMobileMenuOpen.value = !isMobileMenuOpen.value
const closeMobileMenu = () => isMobileMenuOpen.value = false




const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  localStorage.setItem('atlas_sidebar_collapsed', String(isSidebarCollapsed.value))
}

const isVisuallyWide = computed(() => !isSidebarCollapsed.value || isSidebarHovered.value)

const getMenuClass = (menuName: string, currentMenu: string) => {
  const activeClass = menuName === currentMenu 
    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-600 text-blue-600 dark:text-blue-400 font-bold' 
    : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-400 font-medium'
  return `flex items-center gap-4 py-3 border-l-4 rounded-r-xl transition-colors ${activeClass}`
}

const getIconColor = (menuName: string, currentMenu: string) => {
  return menuName === currentMenu ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 flex flex-col transition-colors duration-300">
    
    <header class="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800/50 flex items-center px-4 lg:px-6 z-50 transition-colors duration-300">
      
      <!--Hamburger & Logo-->
      <div class="flex items-center gap-4 lg:gap-5 flex-shrink-0">
        <button @click="toggleSidebar" class="hidden lg:flex p-1.5 -ml-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors flex-shrink-0">
          <Menu class="w-6 h-6" />
        </button>
        
        <button @click="toggleMobileMenu" class="lg:hidden p-1.5 -ml-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors focus:outline-none">
          <Menu class="w-6 h-6" />
        </button>

        <RouterLink to="/admin/dashboard" class="flex items-center gap-3 overflow-hidden whitespace-nowrap cursor-pointer w-[140px] lg:w-[180px] hover:opacity-80 transition-opacity">
          <div class="bg-blue-600 text-white font-bold text-l px-2 py-1 rounded">A</div>
          <div class="flex flex-col justify-center">
            <span class="font-bold text-[22px] text-slate-900 dark:text-white leading-none">Atlas</span>
            <span class="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 tracking-wider uppercase mt-1 leading-none">BY DDTECH</span>
          </div>
        </RouterLink>
      </div>

      <div class="relative w-full max-w-[600px] hidden sm:block ml-2 lg:ml-8 transition-all">
      </div>
      
      <div class="flex items-center gap-3 sm:gap-5 flex-shrink-0 ml-auto">
        
        <!-- THEME TOGGLE -->
        <button @click="toggleTheme" class="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2 rounded-full transition-colors z-[60]">
          <Sun v-if="isDarkMode" class="w-5 h-5" />
          <Moon v-else class="w-5 h-5" />
        </button>

        <!-- DROPDOWN NOTIFIKASI -->
        <div class="relative">
          <div v-if="isNotificationOpen" @click="closeNotification" class="fixed inset-0 z-[55]"></div>

          <button @click="toggleNotification" class="relative text-slate-500 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-full transition z-[60]">
            <Bell class="w-[22px] h-[22px]" />
            <span v-if="unreadCount > 0" class="absolute top-[3px] right-[4px] w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          <div v-if="isNotificationOpen" class="absolute right-0 mt-3 w-80 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 shadow-2xl rounded-xl z-[70] overflow-hidden animate-fade-in origin-top-right transition-colors">
            <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 transition-colors">
              <h3 class="text-[14px] font-bold text-slate-900 dark:text-white transition-colors">Recent</h3>
              <button v-if="unreadCount > 0" @click="markAllAsRead" class="text-[11px] font-bold text-blue-600 hover:underline">
                Mark all as read
              </button>
            </div>
            
            <div class="max-h-[320px] overflow-y-auto custom-scrollbar-vertical">
              <div v-if="recentNotifications.length === 0" class="p-6 text-center text-[12px] text-slate-500 dark:text-slate-400 transition-colors">
                Tidak ada notifikasi saat ini.
              </div>
              <div v-for="notif in recentNotifications" :key="notif.id" @click="markAsRead(notif.id)" :class="['p-4 border-b border-slate-100 dark:border-slate-800/50 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 flex gap-3', notif.unread ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-[#0F172A]']">
                <div class="mt-0.5">
                  <div v-if="notif.icon === 'user'" class="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors"><User class="w-3.5 h-3.5" /></div>
                  <div v-else-if="notif.icon === 'sparkles'" class="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center transition-colors"><Sparkles class="w-3.5 h-3.5" /></div>
                  <div v-else class="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-colors"><Bell class="w-3.5 h-3.5" /></div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start mb-0.5">
                    <h4 class="text-[13px] font-bold transition-colors" :class="notif.unread ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'">{{ notif.title }}</h4>
                    <span v-if="notif.unread" class="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  </div>
                  <p class="text-[12px] text-slate-500 dark:text-slate-400 leading-snug mb-1.5 transition-colors">{{ notif.message }}</p>
                  <span class="text-[10px] font-medium text-slate-400 dark:text-slate-500 transition-colors">{{ notif.time }}</span>
                </div>
              </div>
            </div>
            
            <!-- Tombol View All -->
            <div class="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-center transition-colors">
              <button @click="openNotificationDrawer" class="text-[12px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                View all notifications
              </button>
            </div>
          </div>
        </div>

      </div>
    </header>

    <div class="flex w-full h-[calc(100vh-4rem)] mt-16 relative">
      
      <div v-if="isMobileMenuOpen" @click="closeMobileMenu" class="fixed inset-0 top-16 bg-slate-900/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"></div>

      <aside 
        @mouseenter="isSidebarHovered = true"
        @mouseleave="isSidebarHovered = false"
        :class="[
          'fixed top-16 bottom-0 left-0 z-40 bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800/50 flex flex-col justify-between transition-all duration-300 transform ease-in-out',
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl w-64' : '-translate-x-full lg:translate-x-0',
          !isMobileMenuOpen && isVisuallyWide ? 'lg:w-64' : '',
          !isMobileMenuOpen && !isVisuallyWide ? 'lg:w-[84px]' : '',
          isSidebarCollapsed && isSidebarHovered ? 'lg:shadow-[4px_0_24px_rgba(0,0,0,0.06)] border-r border-transparent' : 'border-r border-slate-200 dark:border-slate-800/50'
        ]"
      >
        <nav class="py-6 flex flex-col transition-all duration-300 flex-1 overflow-y-auto" :class="isVisuallyWide ? 'pr-5' : 'lg:px-3'">
          <div class="mb-3 flex items-center h-5 overflow-hidden transition-all" :class="isVisuallyWide ? 'px-5' : 'lg:justify-center'">
            <span v-if="isVisuallyWide" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Main Menu</span>
            <span v-else class="text-slate-400 font-bold text-[14px] hidden lg:block leading-none -mt-1">•••</span>
          </div>

          <div class="space-y-2">
            <RouterLink to="/admin/dashboard" title="Dashboard" :class="[getMenuClass('dashboard', activeMenu), isVisuallyWide ? 'pl-[20px] pr-6' : 'lg:justify-center lg:px-0']" @click="closeMobileMenu">
              <LayoutDashboard class="w-[24px] h-[24px] flex-shrink-0" :class="getIconColor('dashboard', activeMenu)" />
              <span class="text-[15px] font-semibold tracking-wide whitespace-nowrap" :class="isVisuallyWide ? 'block' : 'lg:hidden'">Dashboard</span>
            </RouterLink>

            <RouterLink to="/admin/leads" title="Leads" :class="[getMenuClass('leads', activeMenu), isVisuallyWide ? 'pl-[20px] pr-6' : 'lg:justify-center lg:px-0']" @click="closeMobileMenu">
              <Users class="w-[24px] h-[24px] flex-shrink-0" :class="getIconColor('leads', activeMenu)" />
              <span class="text-[15px] font-semibold tracking-wide whitespace-nowrap" :class="isVisuallyWide ? 'block' : 'lg:hidden'">Leads</span>
            </RouterLink>

            <RouterLink to="/admin/pipeline" title="Pipeline" :class="[getMenuClass('pipeline', activeMenu), isVisuallyWide ? 'pl-[20px] pr-6' : 'lg:justify-center lg:px-0']" @click="closeMobileMenu">
              <KanbanSquare class="w-[24px] h-[24px] flex-shrink-0" :class="getIconColor('pipeline', activeMenu)" />
              <span class="text-[15px] font-semibold tracking-wide whitespace-nowrap" :class="isVisuallyWide ? 'block' : 'lg:hidden'">Pipeline</span>
            </RouterLink>

            <RouterLink to="/admin/tasks" title="Tasks" :class="[getMenuClass('tasks', activeMenu), isVisuallyWide ? 'pl-[20px] pr-6' : 'lg:justify-center lg:px-0']" @click="closeMobileMenu">
              <CheckSquare class="w-[24px] h-[24px] flex-shrink-0" :class="getIconColor('tasks', activeMenu)" />
              <span class="text-[15px] font-semibold tracking-wide whitespace-nowrap" :class="isVisuallyWide ? 'block' : 'lg:hidden'">Tasks</span>
            </RouterLink>
          </div>

          <div class="mt-8 border-t border-slate-100 pt-4 transition-colors">
            <RouterLink to="/admin/settings" title="Settings" :class="[getMenuClass('settings', activeMenu), isVisuallyWide ? 'pl-[20px] pr-6' : 'lg:justify-center lg:px-0']" @click="closeMobileMenu">
              <Settings class="w-[24px] h-[24px] flex-shrink-0" :class="getIconColor('settings', activeMenu)" />
              <span class="text-[15px] font-semibold tracking-wide whitespace-nowrap" :class="isVisuallyWide ? 'block' : 'lg:hidden'">Settings</span>
            </RouterLink>
          </div>
        </nav>

        <!-- USER PROFILE POPOVER AREA -->
        <div class="relative transition-all duration-300" :class="[isVisuallyWide ? 'p-4' : 'lg:p-3 p-4', isSidebarCollapsed && isSidebarHovered ? 'border-t border-slate-100 dark:border-slate-800/50' : 'border-t border-slate-200 dark:border-slate-800/50']">
          <div ref="userMenuRef">
            <div v-if="isUserMenuOpen" class="absolute bottom-full left-4 mb-2 w-52 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-xl z-50 overflow-hidden animate-fade-in origin-bottom-left transition-colors">
              <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <p class="text-[13px] font-bold text-slate-900 dark:text-white truncate">{{ currentUser.name }}</p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">{{ currentUser.email }}</p>
              </div>
              <div class="p-1.5">
                <RouterLink to="/admin/settings" @click="isUserMenuOpen = false" class="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors">
                  <User class="w-4 h-4" />
                  My Profile
                </RouterLink>
                <div class="my-1 border-t border-slate-100 dark:border-slate-700"></div>
                <button @click="isUserMenuOpen = false" class="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors">
                  <LifeBuoy class="w-4 h-4" />
                  Help & Support
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 -m-2 rounded-xl transition-colors cursor-pointer group" :class="isVisuallyWide ? 'w-full' : 'lg:justify-center'">
              <div @click="toggleUserMenu" class="flex items-center gap-3 min-w-0">
                <div class="w-[40px] h-[40px] rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-[14px] flex items-center justify-center border border-blue-200 dark:border-blue-800/50 flex-shrink-0 shadow-sm transition-colors">
                  {{ currentUser.initials }}
                </div>
                <div class="flex flex-col truncate" :class="isVisuallyWide ? 'block' : 'lg:hidden'">
                  <span class="text-[14px] font-bold text-slate-900 dark:text-white leading-tight truncate transition-colors">{{ currentUser.name }}</span>
                  <span class="text-[12px] font-medium text-slate-500 dark:text-slate-400 truncate transition-colors">{{ currentUser.role }}</span>
                </div>
              </div>

              <!-- TOMBOL LOGOUT -->
              <button v-if="isVisuallyWide" @click.stop="openLogoutModal" title="Log Out" class="text-red-500 hover:text-red-600 dark:hover:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 p-2 rounded-lg transition-all flex-shrink-0">
                <LogOut class="w-4 h-4" />
              </button>
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


  <div v-if="isNotificationDrawerOpen" class="fixed inset-0 z-[90] flex justify-end">
    <div 
      class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
      @click="closeNotificationDrawer"
    ></div>
    <div 
      class="relative w-full max-w-sm bg-white dark:bg-[#0F172A] h-full shadow-2xl flex flex-col transform transition-all duration-300 ease-in-out border-l border-slate-200 dark:border-slate-800"
      :class="isNotificationDrawerOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800/50 transition-colors">
        <h2 class="text-[18px] font-bold text-slate-900 dark:text-white transition-colors">All Notifications</h2>
        <div class="flex items-center gap-3">
          <button v-if="unreadCount > 0" @click="markAllAsRead" class="text-[12px] font-bold text-blue-600 dark:text-blue-400 hover:underline transition-colors">
            Mark all as read
          </button>
          <button @click="closeNotificationDrawer" class="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar-vertical">
        <div v-if="notifications.length === 0" class="p-8 text-center flex flex-col items-center">
          <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3 transition-colors">
            <Bell class="w-6 h-6" />
          </div>
          <p class="text-[14px] font-bold text-slate-700 dark:text-slate-300 transition-colors">You're all caught up!</p>
          <p class="text-[13px] text-slate-500 dark:text-slate-400 mt-1 transition-colors">Belum ada notifikasi baru untuk Anda.</p>
        </div>
        
        <div 
          v-for="notif in notifications" 
          :key="notif.id"
          @click="markAsRead(notif.id)"
          :class="['p-5 border-b border-slate-100 dark:border-slate-800/50 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 flex gap-4', notif.unread ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-[#0F172A]']"
        >
          <div class="mt-1">
            <div v-if="notif.icon === 'user'" class="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-colors"><User class="w-4 h-4" /></div>
            <div v-else-if="notif.icon === 'sparkles'" class="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center transition-colors"><Sparkles class="w-4 h-4" /></div>
            <div v-else class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-colors"><Bell class="w-4 h-4" /></div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start mb-1">
              <h4 class="text-[14px] font-bold transition-colors" :class="notif.unread ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'">{{ notif.title }}</h4>
              <span class="text-[11px] font-semibold text-slate-400 dark:text-slate-500 transition-colors">{{ notif.time }}</span>
            </div>
            <p class="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed mb-2 transition-colors">{{ notif.message }}</p>
            <!-- Badge jika belum dibaca -->
            <span v-if="notif.unread" class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 dark:bg-blue-500 text-white transition-colors">New</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="isLogoutModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="closeLogoutModal"></div>
    <div class="relative bg-white shadow-2xl w-full max-w-[450px] pt-12 pb-10 px-8 text-center rounded-[5px] transition-colors border border-transparent">
      <button @click="closeLogoutModal" class="absolute top-4 right-4 text-blue-600 hover:text-blue-800 transition">
        <X class="w-6 h-6" />
      </button>
      <h2 class="text-[24px] font-bold text-slate-900 mb-2 leading-snug tracking-tight transition-colors">You are attempting to log out of <span class="text-blue-600">Atlas</span></h2>
      <p class="text-[16px] text-slate-500 font-semibold mb-8 transition-colors">Are you sure?</p>
      <div class="flex flex-col gap-3 max-w-[320px] mx-auto">
        <button @click="closeLogoutModal" class="w-full py-2.5 border border-slate-300 bg-white text-slate-900 text-[16px] font-bold hover:bg-slate-50 transition rounded-[5px]">Cancel</button>
        <button @click="confirmLogout" class="w-full py-2.5 bg-blue-600 text-white text-[16px] font-bold hover:bg-blue-700 transition shadow-sm rounded-[5px]">Sign Out</button>
      </div>
    </div>
  </div>
  <ToastNotification />
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