<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MainLayout from '../components/MainLayout.vue'
import api from '../services/api'

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
// ACTIONS
// ==========================================
const saveProfile = async () => {
  try {
    await api.put('/api/admin/users/profile', profileForm.value)
    alert('Profile Settings Saved Successfully!')
  } catch (error) {
    console.error('Save profile error:', error)
    alert('Backend API Error: Failed to save profile.')
  }
}

const inviteEmail = ref('')
const inviteMember = async () => {
  // Simulating an email prompt for simplicity
  const email = prompt("Enter the email of the new member:")
  if (!email) return
  
  try {
    await api.post('/api/admin/users/invite', { email })
    alert('Invitation sent successfully!')
    await fetchSettingsData()
  } catch (error) {
    console.error('Invite member error:', error)
    alert('Backend API Error: Failed to send invitation.')
  }
}

const saveEmailSettings = () => {
  alert('API Endpoint for Email Settings not yet implemented.')
}
</script>

<template>
  <MainLayout active-menu="settings">
    
    <main class="flex-1 p-6 md:p-8 flex flex-col h-screen overflow-y-auto bg-[#F8FAFC] custom-scrollbar">
      
      <!-- HEADER -->
      <div class="mb-8 flex-shrink-0">
        <h1 class="text-[28px] font-bold text-[#0F172A] tracking-tight">Settings</h1>
        <p class="text-[15px] text-[#64748B] mt-1">Manage your account preferences and workspace configuration.</p>
      </div>

      <!-- LAYOUT GRID -->
      <div class="flex flex-col lg:flex-row gap-6 max-w-6xl flex-1 pb-10">
        
        <!-- SIDEBAR MENU -->
        <div class="w-full lg:w-72 bg-white border border-[#E2E8F0] rounded-xl p-3 h-fit shadow-sm flex-shrink-0">
          <nav class="space-y-1">
            <button 
              @click="activeTab = 'profile'"
              :class="['w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-[14px] transition-all', activeTab === 'profile' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#64748B] hover:bg-gray-50']"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              My Profile
            </button>
            
            <button 
              @click="activeTab = 'team'"
              :class="['w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-[14px] transition-all', activeTab === 'team' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#64748B] hover:bg-gray-50']"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Team Management
            </button>

            <button 
              @click="activeTab = 'ai-rules'"
              :class="['w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-[14px] transition-all', activeTab === 'ai-rules' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#64748B] hover:bg-gray-50']"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              AI Scoring Rules
            </button>

            <button 
              @click="activeTab = 'email'"
              :class="['w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-[14px] transition-all', activeTab === 'email' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#64748B] hover:bg-gray-50']"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Email Integrations
            </button>
          </nav>
        </div>

        <!-- MAIN CONFIGURATION AREA -->
        <div class="flex-1 bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-sm">
          
          <!-- ================= TAB: MY PROFILE ================= -->
          <div v-if="activeTab === 'profile'" class="animate-fade-in">
            <h2 class="text-[19px] font-bold text-[#0F172A] mb-1">Profile Settings</h2>
            <p class="text-[14px] text-[#64748B] mb-8">Update your personal information and how others see you on Atlas.</p>
            
            <div class="flex items-center gap-5 mb-8">
              <div class="w-20 h-20 rounded-full bg-[#EBF3FF] text-[#2563EB] font-bold text-2xl flex items-center justify-center border-2 border-white shadow-md">
                JM
              </div>
              <div>
                <button class="px-4 py-2 bg-white border border-[#E2E8F0] rounded-md text-[13px] font-semibold text-[#0F172A] hover:bg-gray-50 transition shadow-sm mb-2">Change Photo</button>
                <p class="text-[12px] text-[#94A3B8]">JPG, PNG or GIF. Max 2MB.</p>
              </div>
            </div>

            <form @submit.prevent="saveProfile">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div>
                  <label class="block text-[13px] font-semibold text-[#0F172A] mb-2">Full Name</label>
                  <input v-model="profileForm.fullName" type="text" class="w-full border border-[#CBD5E1] bg-[#F8FAFC] rounded-lg px-3.5 py-2.5 text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all">
                </div>
                <div>
                  <label class="block text-[13px] font-semibold text-[#0F172A] mb-2">Work Email</label>
                  <input v-model="profileForm.workEmail" type="email" class="w-full border border-[#CBD5E1] bg-[#F8FAFC] rounded-lg px-3.5 py-2.5 text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all">
                </div>
                <div>
                  <label class="block text-[13px] font-semibold text-[#0F172A] mb-2">Job Title</label>
                  <input v-model="profileForm.jobTitle" type="text" class="w-full border border-[#CBD5E1] bg-[#F8FAFC] rounded-lg px-3.5 py-2.5 text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all">
                </div>
              </div>
              <button type="submit" class="bg-[#2563EB] text-white text-[14px] font-semibold py-2.5 px-6 rounded-lg hover:bg-[#1D4ED8] transition shadow-sm">
                Save Profile
              </button>
            </form>
          </div>

          <!-- ================= TAB: TEAM MANAGEMENT ================= -->
          <div v-else-if="activeTab === 'team'" class="animate-fade-in">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h2 class="text-[19px] font-bold text-[#0F172A] mb-1">Team Management</h2>
                <p class="text-[14px] text-[#64748B]">Kelola akses anggota tim dan peran (role) di dalam workspace ini.</p>
              </div>
              <button @click="inviteMember" class="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-bold hover:bg-[#1D4ED8] shadow-sm transition">
                + Invite Member
              </button>
            </div>

            <div class="border border-[#E2E8F0] rounded-xl overflow-hidden bg-white">
              <table class="w-full text-left">
                <thead class="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <tr>
                    <th class="px-4 py-3 text-[12px] font-bold text-[#475569] uppercase tracking-wider">User</th>
                    <th class="px-4 py-3 text-[12px] font-bold text-[#475569] uppercase tracking-wider">Role</th>
                    <th class="px-4 py-3 text-[12px] font-bold text-[#475569] uppercase tracking-wider">Status</th>
                    <th class="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#E2E8F0]">
                  <tr v-for="member in teamMembers" :key="member.id" class="hover:bg-[#F8FAFC] transition">
                    <td class="px-4 py-3">
                      <p class="text-[14px] font-bold text-[#0F172A]">{{ member.name }}</p>
                      <p class="text-[12px] text-[#64748B]">{{ member.email }}</p>
                    </td>
                    <td class="px-4 py-3">
                      <span class="text-[13px] font-medium text-[#475569] bg-[#F1F5F9] px-2.5 py-1 rounded-md border border-[#E2E8F0]">
                        {{ member.role }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <span 
                        :class="['text-[11px] font-bold px-2 py-0.5 rounded border', member.status === 'Active' ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]' : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]']"
                      >
                        {{ member.status }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <button class="text-[13px] font-medium text-[#64748B] hover:text-[#2563EB]">Edit</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- ================= TAB: AI SCORING RULES ================= -->
          <div v-else-if="activeTab === 'ai-rules'" class="animate-fade-in">
            <h2 class="text-[19px] font-bold text-[#0F172A] mb-1">AI Scoring Rules</h2>
            <p class="text-[14px] text-[#64748B] mb-8">Konfigurasi bagaimana AI mengevaluasi dan memberikan tiering pada Lead Anda.</p>

            <div class="space-y-4 max-w-3xl">
              <!-- Toggle 1 -->
              <div class="flex items-start justify-between p-5 border border-[#E2E8F0] rounded-xl bg-white hover:border-[#CBD5E1] transition">
                <div class="pr-6">
                  <h3 class="text-[14.5px] font-bold text-[#0F172A]">Automated Lead Tiering</h3>
                  <p class="text-[13px] text-[#64748B] mt-1">Izinkan AI untuk otomatis mengkategorikan lead ke dalam Tier A, B, atau C berdasarkan skor kualifikasi dari form.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                  <input type="checkbox" v-model="aiRules.autoTiering" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                </label>
              </div>

              <!-- Toggle 2 -->
              <div class="flex items-start justify-between p-5 border border-[#E2E8F0] rounded-xl bg-white hover:border-[#CBD5E1] transition">
                <div class="pr-6">
                  <h3 class="text-[14.5px] font-bold text-[#0F172A]">AI Spam Detection</h3>
                  <p class="text-[13px] text-[#64748B] mt-1">Otomatis pindahkan submission dengan bahasa tidak masuk akal atau domain mencurigakan ke tab Invalid/Spam.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                  <input type="checkbox" v-model="aiRules.spamDetection" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                </label>
              </div>

              <!-- Toggle 3 -->
              <div class="flex items-start justify-between p-5 border border-[#E2E8F0] rounded-xl bg-white hover:border-[#CBD5E1] transition">
                <div class="pr-6">
                  <h3 class="text-[14.5px] font-bold text-[#0F172A]">Data Enrichment <span class="bg-[#EFF6FF] text-[#1D4ED8] text-[10px] font-bold px-2 py-0.5 rounded ml-2">BETA</span></h3>
                  <p class="text-[13px] text-[#64748B] mt-1">Gunakan AI untuk melengkapi data perusahaan (seperti ukuran perusahaan & industri) hanya dari nama domain email.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                  <input type="checkbox" v-model="aiRules.dataEnrichment" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                </label>
              </div>
            </div>
          </div>

          <!-- ================= TAB: EMAIL INTEGRATIONS ================= -->
          <div v-else-if="activeTab === 'email'" class="animate-fade-in">
            <h2 class="text-[19px] font-bold text-[#0F172A] mb-1">Email Integrations</h2>
            <p class="text-[14px] text-[#64748B] mb-8">Hubungkan akun email Anda untuk mengirim dan melacak pesan langsung dari Atlas.</p>

            <!-- Connected Account Card -->
            <div class="flex items-center justify-between p-5 border border-[#E2E8F0] rounded-xl max-w-2xl bg-[#F8FAFC] shadow-sm mb-8">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-center p-2 shadow-sm">
                  <!-- Google Workspace SVG Icon Dummy -->
                 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
	<path d="M0 0h48v48H0z" fill="none" />
	<path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917" />
	<path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691" />
	<path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.9 11.9 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44" />
	<path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917" />
</svg>


                </div>
                <div>
                  <p class="text-[14.5px] font-bold text-[#0F172A]">Google Workspace</p>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="w-2 h-2 rounded-full bg-green-500"></span>
                    <p class="text-[13px] text-[#64748B]">Connected as jordan.miles@atlas.ai</p>
                  </div>
                </div>
              </div>
              <button class="px-4 py-2 bg-white border border-[#CBD5E1] rounded-lg text-[13px] font-bold text-red-600 hover:bg-red-50 shadow-sm transition">
                Disconnect
              </button>
            </div>

            <!-- Email Signature -->
            <form @submit.prevent="saveEmailSettings" class="max-w-2xl">
              <label class="block text-[14px] font-bold text-[#0F172A] mb-2">Email Signature</label>
              <p class="text-[13px] text-[#64748B] mb-3">Tanda tangan ini akan otomatis disematkan di bagian bawah email keluar Anda.</p>
              
              <textarea 
                v-model="emailSettings.signature" 
                rows="4" 
                class="w-full border border-[#CBD5E1] bg-white rounded-xl p-4 text-[13.5px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all mb-4 leading-relaxed"
              ></textarea>
              
              <button type="submit" class="bg-[#2563EB] text-white text-[14px] font-semibold py-2.5 px-6 rounded-lg hover:bg-[#1D4ED8] transition shadow-sm">
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