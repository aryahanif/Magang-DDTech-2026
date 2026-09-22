<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MainLayout from '../components/MainLayout.vue'
import api from '../services/api'
import { User, Users, Sparkles, Mail, X, ShieldUser, Briefcase, Eye } from '@lucide/vue'

// ==========================================
// STATE MANAGEMENT
// ==========================================
const activeTab = ref('profile')
const currentUser = ref(JSON.parse(localStorage.getItem('user') || '{}'))

// Data: Profile
const profileForm = ref({
  name: '',
  email: '',
  job_title: ''
})

// Data: Security
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const isPasswordLoading = ref(false)

// Data: Team Management
const teamMembers = ref<any[]>([])

// Data: AI Scoring Rules
const aiRules = ref({
  autoTiering: true,
  spamDetection: true,
  dataEnrichment: true
})

// Data: Email Integration (Stubbed)
const emailSettings = ref({
  isConnected: false,
  signature: ''
})

const isLoading = ref(false)

// ==========================================
// API CALLS
// ==========================================
const fetchSettingsData = async () => {
  isLoading.value = true
  try {
    // 1. Fetch Profile
    try {
      const profileRes = await api.get('/api/users/profile')
      if (profileRes.data && profileRes.data.success) {
        profileForm.value = profileRes.data.data
      }
    } catch (e) {
      console.warn('Backend API Not Ready: /api/admin/users/profile')
      // Fallback
      profileForm.value = { name: 'Fallback User', email: 'waiting@backend.com', job_title: 'Developer' }
    }

    // 2. Fetch Team
    try {
      const teamRes = await api.get('/api/users')
      if (teamRes.data && teamRes.data.success) {
        teamMembers.value = teamRes.data.data
      } else {
        // Fallback dummy data while backend is not ready
        teamMembers.value = [
          { id: '1', name: 'You (Admin)', email: 'admin@atlas.ai', role: 'Admin', status: 'Active' },
          { id: '2', name: 'Jordan Miles', email: 'jordan.miles@atlas.ai', role: 'Sales Manager', status: 'Active' },
          { id: '3', name: 'Sarah Jenkins', email: 'sarah.j@atlas.ai', role: 'Sales Rep', status: 'Pending' },
        ]
      }
    } catch (e) {
      console.warn('Backend API Not Ready: /api/admin/users')
      teamMembers.value = [{ id: 1, name: 'Fallback User', email: 'waiting@backend', role: 'Admin', status: 'Active' }]
    }

    // 3. Fetch AI Rules
    try {
      const aiRes = await api.get('/api/settings/ai-rules')
      if (aiRes.data && aiRes.data.success) {
        // Map backend to frontend camelCase
        aiRules.value = {
          autoTiering: aiRes.data.data.is_ai_tiering_enabled,
          spamDetection: aiRes.data.data.is_spam_detection_enabled,
          dataEnrichment: aiRes.data.data.is_data_enrichment_enabled
        }
      }
    } catch (e) {
      console.warn('Backend API Not Ready: /api/settings/ai-rules')
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchSettingsData()
})

// ==========================================
// ACTIONS
// ==========================================
import { useToast } from '../composables/UseToast'

const { showToast } = useToast()

const saveProfile = async () => {
  try {
    await api.patch('/api/users/profile', profileForm.value)
    
    // Perbarui localStorage agar nama di sidebar berubah
    const updatedUser = {
      ...currentUser.value,
      name: profileForm.value.name,
      email: profileForm.value.email,
      job_title: profileForm.value.job_title
    }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    
    showToast('Profile Settings Saved Successfully!', 'success')
    
    // Refresh halaman agar MainLayout me-render ulang nama baru
    setTimeout(() => {
      window.location.reload()
    }, 1000)
    
  } catch (error) {
    console.error('Save profile error:', error)
    showToast('Backend API Error: Failed to save profile.', 'error')
  }
}

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    showToast('New passwords do not match!', 'error')
    return
  }
  
  if (passwordForm.value.newPassword.length < 8) {
    showToast('New password must be at least 8 characters long.', 'error')
    return
  }

  isPasswordLoading.value = true
  try {
    const res = await api.post('/api/auth/change-password', {
      current_password: passwordForm.value.currentPassword,
      new_password: passwordForm.value.newPassword
    })
    
    if (res.data.success) {
      showToast('Password updated successfully!', 'success')
      passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    } else {
      showToast(res.data.message || 'Failed to update password', 'error')
    }
  } catch (error: any) {
    console.error('Change password error:', error)
    if (error.response?.data?.message) {
      showToast(error.response.data.message, 'error')
    } else {
      showToast('Backend API Error: Failed to change password.', 'error')
    }
  } finally {
    isPasswordLoading.value = false
  }
}

// ==========================================
// LOGIKA TEAM MANAGEMENT
// ==========================================
const isInviteModalOpen = ref(false)
const inviteForm = ref({
  name: '',
  email: '',
  role: 'sales'
})
const editingRoleId = ref<string | null>(null)

const openInviteModal = () => {
  inviteForm.value = { name: '', email: '', role: 'sales' }
  isInviteModalOpen.value = true
}

const sendInvite = async () => {
  if (!inviteForm.value.email || !inviteForm.value.name) return
  
  try {
    await api.post('/api/users/invite', { name: inviteForm.value.name, email: inviteForm.value.email, role: inviteForm.value.role })
    showToast('Invitation sent successfully!', 'success')
    isInviteModalOpen.value = false
    await fetchSettingsData()
  } catch (error) {
    console.error('Invite error:', error)
    // Optimistic fallback for demonstration
    teamMembers.value.push({
      id: Date.now().toString(),
      name: inviteForm.value.name,
      email: inviteForm.value.email,
      role: inviteForm.value.role,
      status: 'Pending'
    })
    showToast('API Error: User added locally for demonstration.', 'info')
    isInviteModalOpen.value = false
  }
}

const updateRole = async (userId: string, event: Event) => {
  const newRole = (event.target as HTMLSelectElement).value
  try {
    await api.patch(`/api/users/${userId}/role`, { role: newRole })
    const userIndex = teamMembers.value.findIndex(u => u.id === userId)
    if (userIndex !== -1) teamMembers.value[userIndex].role = newRole
    showToast('User role updated successfully!', 'success')
  } catch (error) {
    console.error('Failed to update role:', error)
    // Optimistic fallback for demonstration
    const userIndex = teamMembers.value.findIndex(u => u.id === userId)
    if (userIndex !== -1) teamMembers.value[userIndex].role = newRole
    showToast('API Error: Role updated locally for demonstration.', 'info')
  } finally {
    editingRoleId.value = null
  }
}

// ==========================================
// LOGIKA INTEGRATIONS
// ==========================================
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showToast('Webhook URL copied to clipboard!', 'success')
  } catch (err) {
    console.error('Failed to copy', err)
    showToast('Failed to copy to clipboard', 'error')
  }
}

const saveAiRules = async () => {
  try {
    const payload = {
      is_ai_tiering_enabled: aiRules.value.autoTiering,
      is_spam_detection_enabled: aiRules.value.spamDetection,
      is_data_enrichment_enabled: aiRules.value.dataEnrichment
    };
    await api.patch('/api/settings/ai-rules', payload)
    showToast('AI Rules updated successfully!', 'success')
  } catch (error) {
    console.error('Save AI rules error:', error)
    showToast('Failed to update AI rules', 'error')
  }
}

const saveEmailSettings = () => {
  showToast('API Endpoint for Email Settings not yet implemented.', 'info')
}
</script>

<template>
  <MainLayout active-menu="settings">
    
    <main class="flex-1 p-4 md:p-6 lg:p-8 flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-[#0B1120] custom-scrollbar transition-colors duration-300">
      
      <!-- HEADER -->
      <div class="mb-6 md:mb-8 flex-shrink-0">
        <h1 class="text-[24px] md:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p class="text-[13px] md:text-[15px] text-slate-500 dark:text-slate-400 mt-1">Manage your account preferences and workspace configuration.</p>
      </div>

      <!-- LAYOUT GRID -->
      <div class="flex flex-col lg:flex-row gap-6 max-w-6xl flex-1 pb-10">
        
        <!-- SIDEBAR MENU -->
        <div class="w-full lg:w-72 bg-white/60 dark:bg-[#0F172A]/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/50 rounded-2xl p-3 h-fit shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] flex-shrink-0 transition-colors duration-300">
          <nav class="space-y-1">
            <button 
              @click="activeTab = 'profile'"
              :class="['w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-[13px] md:text-[14px] transition-all', activeTab === 'profile' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50']"
            >
              <User class="w-5 h-5" />
              My Profile
            </button>
            
            <button 
              v-if="currentUser?.role === 'Super Admin'"
              @click="activeTab = 'team'"
              :class="['w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-[13px] md:text-[14px] transition-all', activeTab === 'team' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50']"
            >
              <Users class="w-5 h-5" />
              Team Management
            </button>

            <button 
              v-if="currentUser?.role === 'Super Admin'"
              @click="activeTab = 'ai-rules'"
              :class="['w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-[13px] md:text-[14px] transition-all', activeTab === 'ai-rules' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50']"
            >
              <Sparkles class="w-5 h-5" />
              AI Scoring Rules
            </button>

            <button 
              v-if="currentUser?.role === 'Super Admin'"
              @click="activeTab = 'email'"
              :class="['w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-[13px] md:text-[14px] transition-all', activeTab === 'email' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50']"
            >
              <Mail class="w-5 h-5" />
              Email Integrations
            </button>
          </nav>
        </div>

        <!-- MAIN CONFIGURATION AREA -->
        <div class="flex-1 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/50 rounded-xl p-4 md:p-6 lg:p-8 shadow-sm overflow-hidden transition-colors duration-300">
          
          <!-- ================= TAB: MY PROFILE ================= -->
          <div v-if="activeTab === 'profile'" class="animate-fade-in">
            <h2 class="text-[17px] md:text-[19px] font-bold text-slate-900 dark:text-white mb-1">Personal Information</h2>
            <p class="text-[13px] md:text-[14px] text-slate-500 dark:text-slate-400 mb-6 md:mb-8">Change your profile details and basic information.</p>
            
            <form @submit.prevent="saveProfile" class="border border-slate-200/60 dark:border-slate-800/50 rounded-2xl p-6 md:p-8 bg-white/60 dark:bg-slate-800/20 backdrop-blur-xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] max-w-2xl space-y-5 md:space-y-6">
              <div>
                <label class="block text-[12px] md:text-[13px] font-semibold text-slate-900 dark:text-slate-300 mb-1.5 md:mb-2">Full Name</label>
                <input v-model="profileForm.name" type="text" class="w-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-lg px-3 py-2 md:px-3.5 md:py-2.5 text-[13px] md:text-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all">
              </div>
              <div>
                <label class="block text-[12px] md:text-[13px] font-semibold text-slate-900 dark:text-slate-300 mb-1.5 md:mb-2">Work Email</label>
                <input v-model="profileForm.email" type="email" class="w-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-lg px-3 py-2 md:px-3.5 md:py-2.5 text-[13px] md:text-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all">
              </div>
              <div>
                <label class="block text-[12px] md:text-[13px] font-semibold text-slate-900 dark:text-slate-300 mb-1.5 md:mb-2">Job Title</label>
                <input v-model="profileForm.job_title" type="text" class="w-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-lg px-3 py-2 md:px-3.5 md:py-2.5 text-[13px] md:text-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all">
              </div>
              <div>
                <button type="submit" class="w-full sm:w-auto bg-blue-600 text-white text-[13px] md:text-[14px] font-semibold py-2 md:py-2.5 px-4 md:px-6 rounded-lg hover:bg-blue-700 transition shadow-sm">
                  Save Profile
                </button>
              </div>
            </form>

            <!-- CHANGE PASSWORD SECTION -->
            <div class="mt-10 md:mt-12 pt-8 md:pt-10 border-t border-slate-200 dark:border-slate-800/50">
              <h2 class="text-[17px] md:text-[19px] font-bold text-slate-900 dark:text-white mb-1">Security</h2>
              <p class="text-[13px] md:text-[14px] text-slate-500 dark:text-slate-400 mb-6 md:mb-8">Update your password to keep your account secure.</p>
              
              <form @submit.prevent="changePassword" class="border border-slate-200/60 dark:border-slate-800/50 rounded-2xl p-6 md:p-8 bg-white/60 dark:bg-slate-800/20 backdrop-blur-xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] max-w-2xl space-y-5 md:space-y-6">
                <div>
                  <label class="block text-[12px] md:text-[13px] font-semibold text-slate-900 dark:text-slate-300 mb-1.5 md:mb-2">Current Password</label>
                  <input v-model="passwordForm.currentPassword" type="password" required class="w-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-lg px-3 py-2 md:px-3.5 md:py-2.5 text-[13px] md:text-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all">
                </div>
                <div>
                  <label class="block text-[12px] md:text-[13px] font-semibold text-slate-900 dark:text-slate-300 mb-1.5 md:mb-2">New Password</label>
                  <input v-model="passwordForm.newPassword" type="password" required minlength="6" class="w-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-lg px-3 py-2 md:px-3.5 md:py-2.5 text-[13px] md:text-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all">
                </div>
                <div>
                  <label class="block text-[12px] md:text-[13px] font-semibold text-slate-900 dark:text-slate-300 mb-1.5 md:mb-2">Confirm New Password</label>
                  <input v-model="passwordForm.confirmPassword" type="password" required minlength="6" class="w-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-lg px-3 py-2 md:px-3.5 md:py-2.5 text-[13px] md:text-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all">
                </div>
                <div>
                  <button type="submit" :disabled="isPasswordLoading" class="w-full sm:w-auto bg-blue-600 text-white text-[13px] md:text-[14px] font-semibold py-2 md:py-2.5 px-4 md:px-6 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
                    {{ isPasswordLoading ? 'Updating...' : 'Update Password' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- ================= TAB: TEAM MANAGEMENT ================= -->
          <div v-else-if="activeTab === 'team'" class="animate-fade-in w-full">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
              <div>
                <h2 class="text-[17px] md:text-[19px] font-bold text-slate-900 dark:text-white mb-1">Team Management</h2>
                <p class="text-[13px] md:text-[14px] text-slate-500 dark:text-slate-400">Manage team member access and roles within this workspace.</p>
              </div>
              <button @click="openInviteModal" class="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-bold hover:bg-blue-700 shadow-sm transition">
                + Invite Member
              </button>
            </div>

            <!-- RESPONSIVE TABLE CONTAINER -->
            <div class="border border-slate-200/60 dark:border-slate-800/50 rounded-2xl overflow-hidden bg-white/60 dark:bg-slate-800/20 backdrop-blur-xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] w-full">
              
              <!-- DESKTOP VIEW (Dengan min-width agar tidak acak-acakan di tablet) -->
              <div class="hidden md:block w-full overflow-x-auto custom-scrollbar">
                <table class="w-full text-left min-w-[500px]">
                  <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/50">
                    <tr>
                      <th class="px-4 py-3 text-[12px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">User</th>
                      <th class="px-4 py-3 text-[12px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Role</th>
                      <th class="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200 dark:divide-slate-700/50">
                    <tr v-for="member in teamMembers" :key="'desk-' + member.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td class="px-4 py-3">
                        <p class="text-[14px] font-bold text-slate-900 dark:text-white whitespace-nowrap">{{ member.name }}</p>
                        <p class="text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{{ member.email }}</p>
                      </td>
                      <td class="px-4 py-3">
                        <span 
                          :class="[
                            'text-[12px] font-semibold rounded-full px-2.5 py-1 whitespace-nowrap inline-flex items-center gap-1.5',
                            member.role === 'Super Admin' ? 'bg-indigo-50/80 text-indigo-700' :
                            member.role === 'sales' ? 'bg-emerald-50/80 text-emerald-700' :
                            'bg-slate-100/80 text-slate-600'
                          ]"
                        >
                          <ShieldUser v-if="member.role === 'Super Admin'" class="w-3.5 h-3.5 text-indigo-600" />
                          <Briefcase v-else-if="member.role === 'sales'" class="w-3.5 h-3.5 text-emerald-600" />
                          <Eye v-else class="w-3.5 h-3.5 text-slate-500" />
                          {{ member.role === 'sales' ? 'Sales' : member.role === 'viewer' ? 'Viewer' : member.role }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-right relative">
                        <button @click="editingRoleId = editingRoleId === member.id ? null : member.id" class="text-[13px] font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">Edit</button>
                        <div v-if="editingRoleId === member.id" class="absolute right-8 top-10 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg p-3 z-30 w-48 text-left">
                          <p class="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Change Role</p>
                          <select :value="member.role" @change="updateRole(member.id, $event)" class="w-full text-[13px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md p-1.5 focus:outline-none focus:border-blue-600 mb-2">
                            <option value="Super Admin">Super Admin</option>
                            <option value="sales">Sales</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- MOBILE VIEW (CARD LIST) -->
              <div class="block md:hidden divide-y divide-slate-200 dark:divide-slate-700/50 w-full">
                <div v-for="member in teamMembers" :key="'mob-' + member.id" class="p-4 flex flex-col gap-3">
                  <div class="flex items-start justify-between">
                    <div class="min-w-0 pr-2">
                      <p class="text-[14px] font-bold text-slate-900 dark:text-white truncate">{{ member.name }}</p>
                      <p class="text-[12px] text-slate-500 dark:text-slate-400 truncate">{{ member.email }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 mt-1">
                    <span 
                      :class="[
                        'text-[11px] font-semibold rounded-full px-2 py-0.5 inline-flex items-center gap-1.5',
                        member.role === 'Super Admin' ? 'bg-indigo-50/80 text-indigo-700' :
                        member.role === 'sales' ? 'bg-emerald-50/80 text-emerald-700' :
                        'bg-slate-100/80 text-slate-600'
                      ]"
                    >
                      <ShieldUser v-if="member.role === 'Super Admin'" class="w-3 h-3 text-indigo-600" />
                      <Briefcase v-else-if="member.role === 'sales'" class="w-3 h-3 text-emerald-600" />
                      <Eye v-else class="w-3 h-3 text-slate-500" />
                      {{ member.role === 'sales' ? 'Sales' : member.role === 'viewer' ? 'Viewer' : member.role }}
                    </span>
                    <button @click="editingRoleId = editingRoleId === member.id ? null : member.id" class="text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 ml-auto border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm">
                      Edit
                    </button>
                  </div>
                  
                  <div v-if="editingRoleId === member.id" class="mt-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 shadow-md rounded-xl p-3 animate-fade-in relative z-20">
                    <p class="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Change Role</p>
                    <select :value="member.role" @change="updateRole(member.id, $event)" class="w-full text-[13px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 mb-1 transition-all">
                      <option value="Super Admin">Super Admin</option>
                      <option value="sales">Sales</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ================= TAB: AI SCORING RULES ================= -->
          <div v-else-if="activeTab === 'ai-rules'" class="animate-fade-in">
            <h2 class="text-[17px] md:text-[19px] font-bold text-slate-900 dark:text-white mb-1">AI Scoring Rules</h2>
            <p class="text-[13px] md:text-[14px] text-slate-500 dark:text-slate-400 mb-6 md:mb-8">Configure how AI evaluates and tiers your Leads.</p>

            <div class="space-y-3 md:space-y-4 max-w-3xl">
              <!-- Toggle 1 -->
              <div class="flex flex-col sm:flex-row sm:items-start justify-between p-4 md:p-5 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl bg-white/60 dark:bg-slate-800/20 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.01)] gap-3">
                <div class="pr-0 sm:pr-6 flex-1">
                  <h3 class="text-[13.5px] md:text-[14.5px] font-bold text-slate-900 dark:text-white">Automated Lead Tiering</h3>
                  <p class="text-[12px] md:text-[13px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Allow AI to automatically categorize leads into Tier A, B, or C based on the qualification score from the form.</p>
                </div>
                <div class="flex justify-start sm:justify-end w-full sm:w-auto">
                  <label class="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                    <input type="checkbox" v-model="aiRules.autoTiering" @change="saveAiRules" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <!-- Toggle 2 -->
              <div class="flex flex-col sm:flex-row sm:items-start justify-between p-4 md:p-5 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl bg-white/60 dark:bg-slate-800/20 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.01)] gap-3">
                <div class="pr-0 sm:pr-6 flex-1">
                  <h3 class="text-[13.5px] md:text-[14.5px] font-bold text-slate-900 dark:text-white">AI Spam Detection</h3>
                  <p class="text-[12px] md:text-[13px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Automatically move submissions with nonsensical language or suspicious domains to the Invalid/Spam tab.</p>
                </div>
                <div class="flex justify-start sm:justify-end w-full sm:w-auto">
                  <label class="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                    <input type="checkbox" v-model="aiRules.spamDetection" @change="saveAiRules" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <!-- Toggle 3 -->
              <div class="flex flex-col sm:flex-row sm:items-start justify-between p-4 md:p-5 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl bg-white/60 dark:bg-slate-800/20 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.01)] gap-3">
                <div class="pr-0 sm:pr-6 flex-1">
                  <h3 class="text-[13.5px] md:text-[14.5px] font-bold text-slate-900 dark:text-white flex items-center flex-wrap gap-2">
                    Data Enrichment 
                    <span class="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded">BETA</span>
                  </h3>
                  <p class="text-[12px] md:text-[13px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Use AI to enrich company data (such as company size & industry) just from the email domain name.</p>
                </div>
                <div class="flex justify-start sm:justify-end w-full sm:w-auto">
                  <label class="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                    <input type="checkbox" v-model="aiRules.dataEnrichment" @change="saveAiRules" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- ================= TAB: EMAIL INTEGRATIONS ================= -->
          <div v-else-if="activeTab === 'email'" class="animate-fade-in">
            <h2 class="text-[17px] md:text-[19px] font-bold text-slate-900 dark:text-white mb-1">Email Integrations</h2>
            <p class="text-[13px] md:text-[14px] text-slate-500 dark:text-slate-400 mb-6 md:mb-8">Connect your email account to send and track messages directly from Atlas.</p>

            <!-- Connected Account Card yang Diperbaiki (Menggunakan min-w-0 dan truncate) -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl max-w-2xl bg-white/60 dark:bg-slate-800/20 backdrop-blur-xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] mb-6 md:mb-8 gap-4 transition-colors">
              
              <!-- Bagian Kiri (Icon + Text) -->
              <div class="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                <div class="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1.5 md:p-2 shadow-sm flex-shrink-0 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-full h-full" viewBox="0 0 48 48">
                    <path d="M0 0h48v48H0z" fill="none" />
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917" />
                    <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691" />
                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.9 11.9 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44" />
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917" />
                  </svg>
                </div>
                
                <div class="flex-1 min-w-0">
                  <p class="text-[13.5px] md:text-[14.5px] font-bold text-slate-900 dark:text-white truncate">Google Workspace</p>
                  <div class="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1">
                    <span class="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                    <p class="text-[11px] md:text-[13px] text-slate-500 dark:text-slate-400 truncate">Connected as jordan.miles@atlas.ai</p>
                  </div>
                </div>
              </div>

              <!-- Tombol Disconnect -->
              <button class="w-full sm:w-auto px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-[13px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 shadow-sm transition-colors flex-shrink-0">
                Disconnect
              </button>
            </div>

            <!-- Calendly Webhook Integration -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 border border-slate-200/60 dark:border-slate-800/50 rounded-2xl max-w-2xl bg-white/60 dark:bg-slate-800/20 backdrop-blur-xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] mb-6 md:mb-8 gap-4 hover:border-blue-300 dark:hover:border-slate-700 transition-all">
              <div class="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                <div class="w-10 h-10 md:w-12 md:h-12 bg-blue-50/50 dark:bg-blue-900/30 rounded-xl border border-blue-100 dark:border-blue-800/50 flex items-center justify-center p-1.5 md:p-2 shadow-sm flex-shrink-0 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[13.5px] md:text-[14.5px] font-bold text-slate-900 dark:text-white truncate">Calendly Webhook</p>
                  <p class="text-[11px] md:text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 md:mt-1 truncate leading-relaxed">Paste this URL in your Calendly Integrations.</p>
                </div>
              </div>
              <div class="w-full sm:w-auto flex items-center gap-2">
                <input type="text" readonly value="https://api.atlas.com/api/webhooks/calendly" class="flex-1 sm:w-64 border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg px-3 py-2 text-[12px] text-slate-500 dark:text-slate-400 font-mono focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors">
                <button @click="copyToClipboard('https://api.atlas.com/api/webhooks/calendly')" class="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400 shadow-sm flex items-center justify-center" title="Copy to clipboard">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
            </div>

            <!-- Email Signature -->
            <form @submit.prevent="saveEmailSettings" class="max-w-2xl">
              <label class="block text-[13px] md:text-[14px] font-bold text-slate-900 dark:text-white mb-1.5 md:mb-2">Email Signature</label>
              <p class="text-[12px] md:text-[13px] text-slate-500 dark:text-slate-400 mb-2.5 md:mb-3 leading-relaxed">This signature will be automatically attached at the bottom of your outgoing emails.</p>
              
              <textarea 
                v-model="emailSettings.signature" 
                rows="4" 
                class="w-full border border-slate-200/60 dark:border-slate-700 bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] rounded-2xl p-3 md:p-4 text-[12.5px] md:text-[13.5px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all mb-4 leading-relaxed"
              ></textarea>
              
              <button type="submit" class="w-full sm:w-auto bg-blue-600 text-white text-[13px] md:text-[14px] font-semibold py-2 md:py-2.5 px-4 md:px-6 rounded-lg hover:bg-blue-700 transition shadow-sm">
                Save Email Settings
              </button>
            </form>
          </div>

        </div>
      </div>
    </main>
  </MainLayout>

  <!-- INVITE MEMBER MODAL -->
  <div v-if="isInviteModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="isInviteModalOpen = false"></div>
    <div class="relative bg-white dark:bg-[#0F172A] rounded-xl shadow-2xl w-full max-w-md p-6 sm:p-8 animate-fade-in transition-colors duration-300">
      <div class="flex items-start justify-between mb-6">
        <div>
          <h2 class="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight mb-1">Invite Team Member</h2>
          <p class="text-[13px] text-slate-500 dark:text-slate-400">Send an invitation to join this workspace.</p>
        </div>
        <button @click="isInviteModalOpen = false" class="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <form @submit.prevent="sendInvite" class="space-y-4">
        <div>
          <label class="block text-[13px] font-bold text-slate-900 dark:text-slate-300 mb-1.5">Full Name</label>
          <input v-model="inviteForm.name" type="text" required placeholder="John Doe" class="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-lg px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all">
        </div>
        
        <div>
          <label class="block text-[13px] font-bold text-slate-900 dark:text-slate-300 mb-1.5">Email Address</label>
          <input v-model="inviteForm.email" type="email" required placeholder="name@company.com" class="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-lg px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all">
        </div>
        
        <div>
          <label class="block text-[13px] font-bold text-slate-900 dark:text-slate-300 mb-1.5">Role</label>
          <select v-model="inviteForm.role" class="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-lg px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all cursor-pointer">
            <option value="Super Admin">Super Admin</option>
            <option value="sales">Sales</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        
        <div class="pt-4 flex items-center gap-3 justify-end border-t border-slate-100 dark:border-slate-800/50 mt-6 transition-colors">
          <button type="button" @click="isInviteModalOpen = false" class="px-5 py-2.5 text-[13px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors shadow-sm">Cancel</button>
          <button type="submit" class="px-5 py-2.5 text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm">Send Invitation</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #CBD5E1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #94A3B8;
}
</style>