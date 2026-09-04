<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MainLayout from '../components/MainLayout.vue'
import api from '../services/api'
import { User, Users, Sparkles, Mail, X } from '@lucide/vue'

// ==========================================
// STATE MANAGEMENT
// ==========================================
const activeTab = ref('profile')

// Data: Profile
const profileForm = ref({
  fullName: '',
  workEmail: '',
  jobTitle: ''
})

// Data: Team Management
const teamMembers = ref<any[]>([])

// Data: AI Scoring Rules (Stubbed)
const aiRules = ref({
  autoTiering: true,
  spamDetection: true,
  sentimentAnalysis: false,
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
      const profileRes = await api.get('/api/admin/users/profile')
      if (profileRes.data && profileRes.data.success) {
        profileForm.value = profileRes.data.data
      }
    } catch (e) {
      console.warn('Backend API Not Ready: /api/admin/users/profile')
      // Fallback
      profileForm.value = { fullName: 'Fallback User', workEmail: 'waiting@backend', jobTitle: 'Developer' }
    }

    // 2. Fetch Team
    try {
      const teamRes = await api.get('/api/admin/users')
      if (teamRes.data && teamRes.data.success) {
        teamMembers.value = teamRes.data.data
      }
    } catch (e) {
      console.warn('Backend API Not Ready: /api/admin/users')
      // Fallback
      teamMembers.value = [{ id: 1, name: 'Fallback User', email: 'waiting@backend', role: 'Admin', status: 'Active' }]
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchSettingsData()
})

// ==========================================
/// ==========================================
// ACTIONS (Ubah Bagian Ini)
// ==========================================
import { useToast } from '../composables/UseToast'

const { showToast } = useToast()

const saveProfile = async () => {
  try {
    await api.put('/api/admin/users/profile', profileForm.value)
    showToast('Profile Settings Saved Successfully!', 'success')
  } catch (error) {
    console.error('Save profile error:', error)
    showToast('Backend API Error: Failed to save profile.', 'error')
  }
}

const inviteEmail = ref('')
const inviteMember = async () => {
  // Simulating an email prompt for simplicity
  const email = prompt("Enter the email of the new member:")
  if (!email) return
  
  try {
    await api.post('/api/admin/users/invite', { email })
    showToast('Invitation sent successfully!', 'success')
    await fetchSettingsData()
  } catch (error) {
    console.error('Invite member error:', error)
    showToast('Backend API Error: Failed to send invitation.', 'error')
  }
}

const saveEmailSettings = () => {
  showToast('API Endpoint for Email Settings not yet implemented.', 'info')
}
</script>

<template>
  <MainLayout active-menu="settings">
    
    <main class="flex-1 p-4 md:p-6 lg:p-8 flex flex-col h-screen overflow-y-auto bg-slate-50 custom-scrollbar">
      
      <!-- HEADER -->
      <div class="mb-6 md:mb-8 flex-shrink-0">
        <h1 class="text-[24px] md:text-[28px] font-bold text-slate-900 tracking-tight">Settings</h1>
        <p class="text-[13px] md:text-[15px] text-slate-500 mt-1">Manage your account preferences and workspace configuration.</p>
      </div>

      <!-- LAYOUT GRID -->
      <div class="flex flex-col lg:flex-row gap-6 max-w-6xl flex-1 pb-10">
        
        <!-- SIDEBAR MENU -->
        <div class="w-full lg:w-72 bg-white border border-slate-200 rounded-xl p-3 h-fit shadow-sm flex-shrink-0">
          <nav class="space-y-1">
            <button 
              @click="activeTab = 'profile'"
              :class="['w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-[13px] md:text-[14px] transition-all', activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50']"
            >
              <User class="w-5 h-5" />
              My Profile
            </button>
            
            <button 
              @click="activeTab = 'team'"
              :class="['w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-[13px] md:text-[14px] transition-all', activeTab === 'team' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50']"
            >
              <Users class="w-5 h-5" />
              Team Management
            </button>

            <button 
              @click="activeTab = 'ai-rules'"
              :class="['w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-[13px] md:text-[14px] transition-all', activeTab === 'ai-rules' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50']"
            >
              <Sparkles class="w-5 h-5" />
              AI Scoring Rules
            </button>

            <button 
              @click="activeTab = 'email'"
              :class="['w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-[13px] md:text-[14px] transition-all', activeTab === 'email' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50']"
            >
              <Mail class="w-5 h-5" />
              Email Integrations
            </button>
          </nav>
        </div>

        <!-- MAIN CONFIGURATION AREA -->
        <div class="flex-1 bg-white border border-slate-200 rounded-xl p-4 md:p-6 lg:p-8 shadow-sm overflow-hidden">
          
          <!-- ================= TAB: MY PROFILE ================= -->
          <div v-if="activeTab === 'profile'" class="animate-fade-in">
            <h2 class="text-[17px] md:text-[19px] font-bold text-slate-900 mb-1">Profile Settings</h2>
            <p class="text-[13px] md:text-[14px] text-slate-500 mb-6 md:mb-8">Update your personal information and how others see you on Atlas.</p>
            
            <form @submit.prevent="saveProfile">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                <div>
                  <label class="block text-[12px] md:text-[13px] font-semibold text-slate-900 mb-1.5 md:mb-2">Full Name</label>
                  <input v-model="profileForm.fullName" type="text" class="w-full border border-slate-300 bg-slate-50 rounded-lg px-3 py-2 md:px-3.5 md:py-2.5 text-[13px] md:text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all">
                </div>
                <div>
                  <label class="block text-[12px] md:text-[13px] font-semibold text-slate-900 mb-1.5 md:mb-2">Work Email</label>
                  <input v-model="profileForm.workEmail" type="email" class="w-full border border-slate-300 bg-slate-50 rounded-lg px-3 py-2 md:px-3.5 md:py-2.5 text-[13px] md:text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all">
                </div>
                <div>
                  <label class="block text-[12px] md:text-[13px] font-semibold text-slate-900 mb-1.5 md:mb-2">Job Title</label>
                  <input v-model="profileForm.jobTitle" type="text" class="w-full border border-slate-300 bg-slate-50 rounded-lg px-3 py-2 md:px-3.5 md:py-2.5 text-[13px] md:text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all">
                </div>
              </div>
              <button type="submit" class="w-full sm:w-auto bg-blue-600 text-white text-[13px] md:text-[14px] font-semibold py-2 md:py-2.5 px-4 md:px-6 rounded-lg hover:bg-blue-700 transition shadow-sm">
                Save Profile
              </button>
            </form>
          </div>

          <!-- ================= TAB: TEAM MANAGEMENT ================= -->
          <div v-else-if="activeTab === 'team'" class="animate-fade-in w-full">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
              <div>
                <h2 class="text-[17px] md:text-[19px] font-bold text-slate-900 mb-1">Team Management</h2>
                <p class="text-[13px] md:text-[14px] text-slate-500">Kelola akses anggota tim dan peran (role) di dalam workspace ini.</p>
              </div>
              <button @click="inviteMember" class="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-bold hover:bg-blue-700 shadow-sm transition">
                + Invite Member
              </button>
            </div>

            <!-- RESPONSIVE TABLE CONTAINER -->
            <div class="border border-slate-200 rounded-xl overflow-hidden bg-white w-full">
              
              <!-- DESKTOP VIEW (Dengan min-width agar tidak acak-acakan di tablet) -->
              <div class="hidden md:block w-full overflow-x-auto custom-scrollbar">
                <table class="w-full text-left min-w-[500px]">
                  <thead class="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th class="px-4 py-3 text-[12px] font-bold text-slate-600 uppercase tracking-wider">User</th>
                      <th class="px-4 py-3 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Role</th>
                      <th class="px-4 py-3 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Status</th>
                      <th class="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200">
                    <tr v-for="member in teamMembers" :key="'desk-' + member.id" class="hover:bg-slate-50 transition">
                      <td class="px-4 py-3">
                        <p class="text-[14px] font-bold text-slate-900 whitespace-nowrap">{{ member.name }}</p>
                        <p class="text-[12px] text-slate-500 whitespace-nowrap">{{ member.email }}</p>
                      </td>
                      <td class="px-4 py-3">
                        <!-- Tambahkan whitespace-nowrap agar text role tidak turun -->
                        <span class="text-[13px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 whitespace-nowrap inline-block">
                          {{ member.role }}
                        </span>
                      </td>
                      <td class="px-4 py-3">
                        <span 
                          :class="['text-[11px] font-bold px-2 py-0.5 rounded border whitespace-nowrap inline-block', member.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200']"
                        >
                          {{ member.status }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-right">
                        <button class="text-[13px] font-medium text-slate-500 hover:text-blue-600">Edit</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- MOBILE VIEW (CARD LIST) -->
              <div class="block md:hidden divide-y divide-slate-200 w-full">
                <div v-for="member in teamMembers" :key="'mob-' + member.id" class="p-4 flex flex-col gap-3">
                  <div class="flex items-start justify-between">
                    <div class="min-w-0 pr-2">
                      <p class="text-[14px] font-bold text-slate-900 truncate">{{ member.name }}</p>
                      <p class="text-[12px] text-slate-500 truncate">{{ member.email }}</p>
                    </div>
                    <button class="p-1 text-slate-400 hover:text-slate-700 flex-shrink-0">
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {{ member.role }}
                    </span>
                    <span 
                      :class="['text-[10px] font-bold px-2 py-0.5 rounded border', member.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200']"
                    >
                      {{ member.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ================= TAB: AI SCORING RULES ================= -->
          <div v-else-if="activeTab === 'ai-rules'" class="animate-fade-in">
            <h2 class="text-[17px] md:text-[19px] font-bold text-slate-900 mb-1">AI Scoring Rules</h2>
            <p class="text-[13px] md:text-[14px] text-slate-500 mb-6 md:mb-8">Konfigurasi bagaimana AI mengevaluasi dan memberikan tiering pada Lead Anda.</p>

            <div class="space-y-3 md:space-y-4 max-w-3xl">
              <!-- Toggle 1 -->
              <div class="flex flex-col sm:flex-row sm:items-start justify-between p-4 md:p-5 border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition gap-3">
                <div class="pr-0 sm:pr-6 flex-1">
                  <h3 class="text-[13.5px] md:text-[14.5px] font-bold text-slate-900">Automated Lead Tiering</h3>
                  <p class="text-[12px] md:text-[13px] text-slate-500 mt-1 leading-relaxed">Izinkan AI untuk otomatis mengkategorikan lead ke dalam Tier A, B, atau C berdasarkan skor kualifikasi dari form.</p>
                </div>
                <div class="flex justify-start sm:justify-end w-full sm:w-auto">
                  <label class="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                    <input type="checkbox" v-model="aiRules.autoTiering" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <!-- Toggle 2 -->
              <div class="flex flex-col sm:flex-row sm:items-start justify-between p-4 md:p-5 border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition gap-3">
                <div class="pr-0 sm:pr-6 flex-1">
                  <h3 class="text-[13.5px] md:text-[14.5px] font-bold text-slate-900">AI Spam Detection</h3>
                  <p class="text-[12px] md:text-[13px] text-slate-500 mt-1 leading-relaxed">Otomatis pindahkan submission dengan bahasa tidak masuk akal atau domain mencurigakan ke tab Invalid/Spam.</p>
                </div>
                <div class="flex justify-start sm:justify-end w-full sm:w-auto">
                  <label class="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                    <input type="checkbox" v-model="aiRules.spamDetection" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <!-- Toggle 3 -->
              <div class="flex flex-col sm:flex-row sm:items-start justify-between p-4 md:p-5 border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition gap-3">
                <div class="pr-0 sm:pr-6 flex-1">
                  <h3 class="text-[13.5px] md:text-[14.5px] font-bold text-slate-900 flex items-center flex-wrap gap-2">
                    Data Enrichment 
                    <span class="bg-blue-50 text-blue-700 text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded">BETA</span>
                  </h3>
                  <p class="text-[12px] md:text-[13px] text-slate-500 mt-1 leading-relaxed">Gunakan AI untuk melengkapi data perusahaan (seperti ukuran perusahaan & industri) hanya dari nama domain email.</p>
                </div>
                <div class="flex justify-start sm:justify-end w-full sm:w-auto">
                  <label class="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                    <input type="checkbox" v-model="aiRules.dataEnrichment" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- ================= TAB: EMAIL INTEGRATIONS ================= -->
          <div v-else-if="activeTab === 'email'" class="animate-fade-in">
            <h2 class="text-[17px] md:text-[19px] font-bold text-slate-900 mb-1">Email Integrations</h2>
            <p class="text-[13px] md:text-[14px] text-slate-500 mb-6 md:mb-8">Hubungkan akun email Anda untuk mengirim dan melacak pesan langsung dari Atlas.</p>

            <!-- Connected Account Card yang Diperbaiki (Menggunakan min-w-0 dan truncate) -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 border border-slate-200 rounded-xl max-w-2xl bg-slate-50 shadow-sm mb-6 md:mb-8 gap-4">
              
              <!-- Bagian Kiri (Icon + Text) -->
              <div class="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                <div class="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1.5 md:p-2 shadow-sm flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-full h-full" viewBox="0 0 48 48">
                    <path d="M0 0h48v48H0z" fill="none" />
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917" />
                    <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691" />
                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.9 11.9 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44" />
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917" />
                  </svg>
                </div>
                
                <div class="flex-1 min-w-0">
                  <p class="text-[13.5px] md:text-[14.5px] font-bold text-slate-900 truncate">Google Workspace</p>
                  <div class="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1">
                    <span class="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                    <p class="text-[11px] md:text-[13px] text-slate-500 truncate">Connected as jordan.miles@atlas.ai</p>
                  </div>
                </div>
              </div>

              <!-- Tombol Disconnect -->
              <button class="w-full sm:w-auto px-4 py-2 bg-white border border-slate-300 rounded-lg text-[13px] font-bold text-red-600 hover:bg-red-50 shadow-sm transition flex-shrink-0">
                Disconnect
              </button>
            </div>

            <!-- Email Signature -->
            <form @submit.prevent="saveEmailSettings" class="max-w-2xl">
              <label class="block text-[13px] md:text-[14px] font-bold text-slate-900 mb-1.5 md:mb-2">Email Signature</label>
              <p class="text-[12px] md:text-[13px] text-slate-500 mb-2.5 md:mb-3 leading-relaxed">Tanda tangan ini akan otomatis disematkan di bagian bawah email keluar Anda.</p>
              
              <textarea 
                v-model="emailSettings.signature" 
                rows="4" 
                class="w-full border border-slate-300 bg-white rounded-xl p-3 md:p-4 text-[12.5px] md:text-[13.5px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all mb-4 leading-relaxed"
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