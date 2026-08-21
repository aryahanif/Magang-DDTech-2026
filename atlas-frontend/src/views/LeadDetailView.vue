<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '../components/MainLayout.vue'

const route = useRoute()
const router = useRouter()
const leadId = route.params.id

// ==========================================
// 1. DATA DUMMY DEFAULT (Fallback jika di-refresh)
// ==========================================
const defaultLead = {
  id: leadId,
  full_name: 'Sarah Whitfield',
  email: 'sarah@meridianlogistics.com.au',
  phone: '+61 412 345 678',
  company_name: 'Meridian Logistics',
  country: 'Australia',
  business_type: 'Mortgage Broker',
  industry: 'Finance & Logistics',
  role: 'Head of Operations',
  website_url: 'https://meridianlogistics.com.au',
  company_size: '51-200',
  current_problem: 'Manual client onboarding and document collection is taking too much time.',
  automation_interest: 'AI assistant for broker workflow and document parsing.',
  preferred_contact_method: 'Email',
  message: 'We want to explore automation for our intake process.',
  source_page: '/requestdemo',
  utm_source: 'linkedin',
  consent_status: true,
  created_at: '2026-08-20T10:00:00Z',
  
  // AI Qualification Fields
  lead_score: 86,
  lead_tier: 'Tier A',
  fit_status: 'Strong fit',
  qualification_summary: 'Australian mortgage broker firm seeking automation for client intake and document processing. Strong fit for Atlas AI Workforce Platform.',
  recommended_next_action: 'Schedule discovery call within 24 hours.',
  risk_flags: ['Needs budget confirmation', 'No employee count provided'],
  
  // CRM Fields
  status: 'Demo Scheduled',
  assigned_owner: 'AC (Aldean)',
  next_follow_up_at: '2026-08-22T14:00:00Z',

  // Notes & Activity
  notes: [
    { id: 1, note: 'Lead requested a demo via LinkedIn campaign.', created_by: 'System', created_at: '2026-08-20T10:05:00Z' },
    { id: 2, note: 'Called the office, spoke with Sarah. Very interested in document parsing.', created_by: 'AC (Aldean)', created_at: '2026-08-20T15:30:00Z' }
  ],
  activity_logs: [
    { id: 1, type: 'lead_created', description: 'Lead submitted via website form.', created_at: '2026-08-20T10:00:00Z' },
    { id: 2, type: 'ai_qualified', description: 'AI assigned Tier A with score 86.', created_at: '2026-08-20T10:00:05Z' },
    { id: 3, type: 'status_changed', description: 'Status changed from New Lead to Demo Scheduled.', created_at: '2026-08-20T15:35:00Z' },
    { id: 4, type: 'note_added', description: 'Internal note added by AC.', created_at: '2026-08-20T15:30:00Z' }
  ]
}

// ==========================================
// 2. LOGIKA DINAMIS (Mapping data dari tabel + fallback)
// ==========================================
const getInitialData = () => {
  const storedData = sessionStorage.getItem('selectedLead')
  if (storedData) {
    try {
      const parsed = JSON.parse(storedData)
      
      // Jika data dari tabel LeadsView (struktur lama: name, company, tier, status)
      // Mapping ke struktur LeadDetailView
      if (parsed.name && !parsed.full_name) {
        return {
          ...defaultLead, // Pakai semua data default sebagai base
          id: parsed.id || defaultLead.id,
          full_name: parsed.name || defaultLead.full_name,
          company_name: parsed.company || defaultLead.company_name,
          role: parsed.role || defaultLead.role,
          country: parsed.country || defaultLead.country,
          lead_tier: parsed.tier || defaultLead.lead_tier,
          status: parsed.status || defaultLead.status,
          source: parsed.source || defaultLead.utm_source,
        }
      }
      
      // Jika data sudah lengkap (format baru)
      if (parsed.full_name) {
        return parsed
      }
    } catch (e) {
      console.error('Failed to parse stored lead data', e)
    }
  }
  return defaultLead
}

const lead = ref<any>(getInitialData())

// ==========================================
// 3. UI STATE & FUNCTIONS (Tanpa API)
// ==========================================
const isEditingSummary = ref(false)
const newNote = ref('')

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', month: 'short', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  })
}

const updateStatus = (newStatus: string) => {
  lead.value.status = newStatus
  lead.value.activity_logs.unshift({
    id: Date.now(),
    type: 'status_changed',
    description: `Status diubah menjadi ${newStatus}.`,
    created_at: new Date().toISOString()
  })
}

const submitNote = () => {
  if (!newNote.value.trim()) return
  
  lead.value.notes.unshift({
    id: Date.now(),
    note: newNote.value,
    created_by: 'AC (Aldean)',
    created_at: new Date().toISOString()
  })
  
  lead.value.activity_logs.unshift({
    id: Date.now(),
    type: 'note_added',
    description: 'Catatan internal ditambahkan.',
    created_at: new Date().toISOString()
  })
  
  newNote.value = ''
}

const toggleEditSummary = () => {
  isEditingSummary.value = !isEditingSummary.value
}
</script>

<template>
  <MainLayout active-menu="leads">
    <!-- 1. PERBAIKAN: Ubah min-h-screen menjadi flex flex-col -->
    <main class="flex-1 p-8 overflow-y-auto bg-[#F8FAFC] flex flex-col">
      
      <!-- HEADER: Back Button & Lead Identity -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 flex-shrink-0">
        <div class="flex items-center gap-4">
          <button @click="router.push('/admin/leads')" class="p-2 rounded-lg border border-[#E2E8F0] bg-white hover:bg-gray-50 transition">
            <svg class="w-5 h-5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 class="text-[28px] font-bold text-[#0F172A] leading-tight">{{ lead.full_name }}</h1>
            <p class="text-[14px] text-[#64748B]">{{ lead.role }} at {{ lead.company_name }}</p>
          </div>
        </div>

        <!-- Quick Actions & Status -->
        <div class="flex items-center gap-3">
          <select 
            :value="lead.status" 
            @change="updateStatus(($event.target as HTMLSelectElement).value)"
            class="text-[14px] font-semibold border border-[#E2E8F0] rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer"
          >
            <option value="New Lead">New Lead</option>
            <option value="Qualified">Qualified</option>
            <option value="Contacted">Contacted</option>
            <option value="Demo Scheduled">Demo Scheduled</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
          
          <button class="bg-[#2563EB] text-white text-[14px] font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Schedule Follow-up
          </button>
        </div>
      </div>

      <!-- MAIN GRID: 2 Kolom -->
      <!-- 2. PERBAIKAN: Tambahkan flex-1 agar grid ini memakan sisa tinggi layar -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        <!-- KOLOM KIRI (2/3): Informasi & AI -->
        <!-- 3. PERBAIKAN: Gunakan flex flex-col gap-6 (lebih aman dari space-y-6) -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          
          <!-- 1. AI Qualification Summary -->
          <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 flex-shrink-0">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-[18px] font-bold text-[#0F172A] flex items-center gap-2">
                <svg class="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                AI Qualification Summary
              </h2>
              <div class="flex items-center gap-3">
                <span class="text-[12px] font-bold px-2.5 py-1 rounded bg-[#DBEAFE] text-[#1E40AF]">Score: {{ lead.lead_score }}/100</span>
                <span class="text-[12px] font-bold px-2.5 py-1 rounded bg-[#2563EB] text-white">{{ lead.lead_tier }}</span>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">Fit Status</label>
                <p class="text-[14px] text-[#0F172A] font-medium">{{ lead.fit_status }}</p>
              </div>
              
              <div>
                <label class="block text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">Summary</label>
                <textarea v-if="isEditingSummary" v-model="lead.qualification_summary" class="w-full border border-[#E2E8F0] rounded-lg p-3 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#2563EB] min-h-[100px]"></textarea>
                <p v-else class="text-[14px] text-[#334155] leading-relaxed bg-[#F8FAFC] p-3 rounded-lg border border-[#F1F5F9]">
                  {{ lead.qualification_summary }}
                </p>
              </div>

              <div>
                <label class="block text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">Recommended Next Action</label>
                <textarea v-if="isEditingSummary" v-model="lead.recommended_next_action" class="w-full border border-[#E2E8F0] rounded-lg p-3 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"></textarea>
                <p v-else class="text-[14px] text-[#2563EB] font-semibold bg-[#EFF6FF] p-3 rounded-lg border border-[#DBEAFE]">
                  {{ lead.recommended_next_action }}
                </p>
              </div>

              <div v-if="lead.risk_flags && lead.risk_flags.length > 0">
                <label class="block text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">Risk Flags</label>
                <div class="flex flex-wrap gap-2">
                  <span v-for="(flag, index) in lead.risk_flags" :key="index" class="text-[12px] font-medium px-2.5 py-1 rounded bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]">
                    {{ flag }}
                  </span>
                </div>
              </div>

              <div class="pt-2 border-t border-[#F1F5F9] flex justify-end">
                <button @click="toggleEditSummary" class="text-[13px] font-semibold text-[#2563EB] hover:text-blue-800 transition px-3 py-1.5">
                  {{ isEditingSummary ? 'Cancel Edit' : 'Edit AI Output' }}
                </button>
              </div>
            </div>
          </div>

          <!-- 2. Submitted Form Data -->
          <!-- PERBAIKAN EKSTRA: Diberi flex-1 agar seimbang sejajar dengan Notes di kanan -->
          <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 flex-1">
            <h2 class="text-[18px] font-bold text-[#0F172A] mb-4">Submitted Form Data</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label class="block text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Full Name</label>
                <p class="text-[14px] text-[#0F172A]">{{ lead.full_name }}</p>
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Email</label>
                <a :href="`mailto:${lead.email}`" class="text-[14px] text-[#2563EB] hover:underline">{{ lead.email }}</a>
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Phone</label>
                <p class="text-[14px] text-[#0F172A]">{{ lead.phone }}</p>
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Company</label>
                <p class="text-[14px] text-[#0F172A]">{{ lead.company_name }}</p>
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Country</label>
                <p class="text-[14px] text-[#0F172A]">{{ lead.country }}</p>
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Business Type</label>
                <p class="text-[14px] text-[#0F172A]">{{ lead.business_type }}</p>
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Company Size</label>
                <p class="text-[14px] text-[#0F172A]">{{ lead.company_size }}</p>
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Preferred Contact</label>
                <p class="text-[14px] text-[#0F172A]">{{ lead.preferred_contact_method }}</p>
              </div>
              
              <div class="md:col-span-2">
                <label class="block text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Current Problem</label>
                <p class="text-[14px] text-[#334155] bg-[#F8FAFC] p-3 rounded-lg border border-[#F1F5F9]">{{ lead.current_problem }}</p>
              </div>
              <div class="md:col-span-2">
                <label class="block text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Automation Interest</label>
                <p class="text-[14px] text-[#334155] bg-[#F8FAFC] p-3 rounded-lg border border-[#F1F5F9]">{{ lead.automation_interest }}</p>
              </div>
              <div class="md:col-span-2">
                <label class="block text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Message</label>
                <p class="text-[14px] text-[#334155] bg-[#F8FAFC] p-3 rounded-lg border border-[#F1F5F9]">{{ lead.message }}</p>
              </div>
            </div>
          </div>

        </div>

        <!-- KOLOM KANAN (1/3): Aksi, Notes, Log -->
        <!-- 4. PERBAIKAN: Gunakan gap-6 -->
        <div class="flex flex-col gap-6 h-full">
          
          <!-- 3. Lead Details & Assignment -->
          <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 flex-shrink-0">
            <h2 class="text-[16px] font-bold text-[#0F172A] mb-4">Lead Details</h2>
            <div class="space-y-3">
              <div>
                <label class="block text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Assigned Owner</label>
                <select class="w-full text-[14px] border border-[#E2E8F0] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]">
                  <option>Unassigned</option>
                  <option selected>AC (Aldean)</option>
                  <option>JM (Jordan)</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Next Follow-up</label>
                <input type="datetime-local" :value="lead.next_follow_up_at ? lead.next_follow_up_at.slice(0, 16) : ''" class="w-full text-[14px] border border-[#E2E8F0] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]">
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Source</label>
                <p class="text-[14px] text-[#0F172A]">{{ lead.utm_source || 'Direct' }} <span class="text-[#94A3B8]">({{ lead.source_page || '-' }})</span></p>
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Created At</label>
                <p class="text-[14px] text-[#64748B]">{{ formatDate(lead.created_at) }}</p>
              </div>
            </div>
          </div>

          <!-- 4. Add Note -->
          <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 flex-shrink-0">
            <h2 class="text-[16px] font-bold text-[#0F172A] mb-3">Add Internal Note</h2>
            <textarea 
              v-model="newNote" 
              rows="3" 
              placeholder="Tulis catatan internal tentang lead ini..." 
              class="w-full text-[14px] border border-[#E2E8F0] rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#2563EB] resize-none mb-3"
            ></textarea>
            <button 
              @click="submitNote" 
              :disabled="!newNote.trim()"
              class="w-full bg-[#0F172A] text-white text-[13px] font-semibold py-2 rounded-lg hover:bg-[#1E293B] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Simpan Catatan
            </button>
          </div>

          <!-- 5. Activity Log -->
          <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 flex-shrink-0">
            <h2 class="text-[16px] font-bold text-[#0F172A] mb-4">Activity Log</h2>
            <div class="relative border-l-2 border-[#E2E8F0] ml-2 space-y-6 pl-6 pb-2">
              <div v-for="log in lead.activity_logs" :key="log.id" class="relative">
                <div class="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#2563EB] border-2 border-white shadow-sm"></div>
                <p class="text-[13px] text-[#0F172A] font-medium leading-snug">{{ log.description }}</p>
                <p class="text-[11px] text-[#94A3B8] mt-0.5">{{ formatDate(log.created_at) }}</p>
              </div>
            </div>
          </div>

          <!-- 6. Notes History -->
          <!-- Karena kontainer utamanya (main & grid) sekarang melar sampai dasar layar, flex-1 di sini akan sempurna -->
          <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 flex-1 flex flex-col min-h-[250px]">
            <h2 class="text-[16px] font-bold text-[#0F172A] mb-4 flex-shrink-0">Notes History</h2>
            
            <div class="space-y-4 flex-1 overflow-y-auto pr-2">
              <div v-for="note in lead.notes" :key="note.id" class="bg-[#F8FAFC] p-3 rounded-lg border border-[#F1F5F9]">
                <p class="text-[13px] text-[#334155] leading-relaxed mb-2">{{ note.note }}</p>
                <div class="flex items-center justify-between text-[11px] text-[#94A3B8]">
                  <span class="font-medium">{{ note.created_by }}</span>
                  <span>{{ formatDate(note.created_at) }}</span>
                </div>
              </div>
              
              <div v-if="lead.notes.length === 0" class="text-center py-6 text-gray-400 text-sm">
                Belum ada catatan internal.
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  </MainLayout>
</template>

<style scoped>
/* Animasi halus saat data muncul */
@keyframes fadeInUp {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out forwards;
}
</style>