<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '../components/MainLayout.vue'
import api from '../services/api'
import { useToast } from '../composables/UseToast'
import { ArrowLeft, Download, Bot, CheckCircle2, User, Loader2 } from '@lucide/vue'

const route = useRoute();
const router = useRouter();
const { showToast } = useToast();
const leadId = route.params.id as string;

//STATE MANAGEMENT
const currentUser = ref(JSON.parse(localStorage.getItem('user') || '{}'))

const lead = ref<any>({
  notes: [],
  activity_logs: []
})
const isLoading = ref(true)
const errorMessage = ref('')
const tempFollowUpDate = ref('')
const isEditingSummary = ref(false)
const newNote = ref('')

// API CALLS
const fetchLeadDetail = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get(`/api/admin/leads/${leadId}`)
    if (response.data && response.data.success) {
      const data = response.data.data
      
      // Use backend status directly
      const stageStr = data.status || 'New Lead'
      data.status = stageStr
      
      lead.value = data
      
      if (data.next_follow_up_at) {
        const dateObj = new Date(data.next_follow_up_at);
        const offset = dateObj.getTimezoneOffset() * 60000;
        tempFollowUpDate.value = new Date(dateObj.getTime() - offset).toISOString().slice(0, 16);
      } else {
        tempFollowUpDate.value = '';
      }
    } else {
      errorMessage.value = 'Failed to load lead details.'
    }
  } catch (error) {
    console.error('Error fetching lead detail:', error)
    errorMessage.value = 'API Error: Failed to load lead details.'
    
    // TEMPORARY FALLBACK (To prevent breaking the UI completely while backend is not ready)
    lead.value = {
      id: leadId,
      full_name: 'Backend API Not Ready',
      email: 'waiting@backend.com',
      notes: [],
      activity_logs: [],
      status: 'New Lead'
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchLeadDetail()
})

const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const updateStatus = async (newStatus: string) => {
  const previousStatus = lead.value.status
  lead.value.status = newStatus
  
  // Send the status exactly as selected
  let backendStatus = newStatus

  try {
    await api.patch(`/api/admin/leads/${leadId}`, { status: backendStatus })
    // Refresh to get new activity logs
    await fetchLeadDetail()
    showToast('Status berhasil diubah.', 'success')
  } catch (error) {
    console.error('Failed to update status:', error)
    lead.value.status = previousStatus // Revert on fail
    showToast('Backend API Error: Failed to update status.', 'error')
  }
}

const submitNote = async () => {
  if (!newNote.value.trim()) return
  
  const noteText = newNote.value
  newNote.value = '' // Optimistic UI clear
  
  // Optimistically add to UI first
  const newMockNote = {
    id: Date.now().toString(),
    note: noteText,
    created_by: lead.value.assigned_owner || 'Admin',
    created_at: new Date().toISOString()
  };
  if (!lead.value.notes) lead.value.notes = [];
  lead.value.notes.unshift(newMockNote);

  try {
    await api.post(`/api/admin/leads/${leadId}/notes`, { note: noteText })
    // We do NOT fetchLeadDetail() here because the backend might not return notes yet.
    showToast('Catatan berhasil ditambahkan.', 'success')
  } catch (error) {
    console.error('Failed to submit note:', error)
    showToast('Backend API Error: Mock catatan ditambahkan ke tampilan.', 'info')
  }
}

const toggleEditSummary = () => {
  isEditingSummary.value = !isEditingSummary.value;
  if (!isEditingSummary.value) {
    showToast("Perubahan rangkuman AI berhasil disimpan.", "success");
  }
};

const updateOwner = async (event: Event) => {
  const newOwner = (event.target as HTMLSelectElement).value;
  try {
    await api.patch(`/api/admin/leads/${leadId}`, { assigned_owner: newOwner });
    showToast('Owner berhasil diubah.', 'success');
  } catch (error) {
    console.error('Failed to update owner:', error);
    showToast('Backend API Error: Mock owner diterapkan ke tampilan.', 'info');
  }
};

const updateFollowUpDate = async () => {
  if (!tempFollowUpDate.value) return;
  const isoDate = new Date(tempFollowUpDate.value).toISOString();
  try {
    await api.patch(`/api/admin/leads/${leadId}`, { next_follow_up_at: isoDate });
    lead.value.next_follow_up_at = isoDate;
    showToast('Tanggal follow-up berhasil disimpan.', 'success');
  } catch (error) {
    console.error('Failed to update follow-up date:', error);
    showToast('Backend API Error: Gagal menyimpan tanggal.', 'error');
  }
};

//EKSPOR KE CSV
const exportDetailToCSV = () => {
  if (!lead.value) return;

  const data = lead.value;
  const headers = [
    "Lead ID",
    "Full Name",
    "Role",
    "Company",
    "Email",
    "Phone",
    "Country",
    "Business Type",
    "Tier",
    "Status",
    "Lead Score",
    "Created At",
  ];
  const csvRow = [
    data.id,
    `"${data.full_name}"`,
    `"${data.role}"`,
    `"${data.company_name}"`,
    `"${data.email}"`,
    `"${data.phone}"`,
    `"${data.country}"`,
    `"${data.business_type}"`,
    `"${data.lead_tier}"`,
    `"${data.status}"`,
    data.lead_score,
    `"${formatDate(data.created_at)}"`,
  ].join(",");

  const csvContent = [headers.join(","), csvRow].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  const cleanName = data.full_name.replace(/\s+/g, "_");
  link.setAttribute("href", url);
  link.setAttribute("download", `Lead_${cleanName}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast(`Detail data ${data.full_name} berhasil diekspor.`, "success");
};
</script>

<template>
  <MainLayout active-menu="leads">
    <main
      class="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-[#F8FAFC] flex flex-col w-full max-w-full"
    >
      <!-- HEADER & IDENTITAS -->
      <div
        v-if="isLoading"
        class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 flex-shrink-0 animate-pulse"
      >
        <div class="flex items-center gap-4">
          <div class="w-9 h-9 bg-gray-200 rounded-lg"></div>
          <div>
            <div class="h-8 bg-gray-300 rounded w-48 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        <div class="flex gap-2">
          <div class="h-10 bg-gray-200 rounded w-32"></div>
          <div class="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>

      <div
        v-else-if="lead"
        class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 flex-shrink-0 animate-fade-in"
      >
        <div class="flex items-center gap-4">
          <button
            @click="router.push('/admin/leads')"
            class="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
          >
            <ArrowLeft class="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <h1
              class="text-[24px] sm:text-[28px] font-bold text-slate-900 leading-tight flex items-center gap-3"
            >
              {{ lead.full_name }}
              <span
                class="px-2 py-0.5 text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200 rounded-md"
                >{{ lead.lead_tier }}</span
              >
            </h1>
            <p class="text-[13px] sm:text-[14px] text-slate-500 mt-1">
              {{ lead.role }} at
              <span class="font-bold text-slate-900">{{
                lead.company_name
              }}</span>
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <button
            @click="exportDetailToCSV"
            class="w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-[13px] font-bold hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 shadow-sm transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <Download class="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors duration-200" />
            Export CSV
          </button>
          <select
            v-model="lead.status"
            :disabled="currentUser?.role === 'viewer'"
            @change="updateStatus(($event.target as HTMLSelectElement).value)"
            class="flex-1 sm:flex-none text-[13px] sm:text-[14px] font-semibold border border-slate-200 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer disabled:opacity-60"
          >
            <option value="New Lead">New Lead</option>
            <option value="Qualified">Qualified</option>
            <option value="Contacted">Contacted</option>
            <option value="Meeting Requested">Meeting Requested</option>
            <option value="Demo Scheduled">Demo Scheduled</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
            <option value="Disqualified">Disqualified</option>
          </select>
        </div>
      </div>

      <!-- MAIN GRID: 2 Kolom -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <!-- KOLOM KIRI (2/3): Informasi & AI -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          <!-- SKELETON & AI LOADING KOLOM KIRI -->
          <template v-if="isLoading">
            <!-- AI Loading State -->
            <div
              class="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center min-h-[300px] animate-fade-in relative overflow-hidden"
            >
              <Loader2 class="w-10 h-10 text-slate-400 animate-spin mb-4" />
              <h3 class="text-[16px] font-bold text-slate-900 mb-1">Analyzing Lead Data...</h3>
              <p class="text-[13px] text-slate-500 font-medium">Extracting signals and scoring qualification</p>
            </div>
            
            <!-- Skeleton for form data -->
            <div
              class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-pulse mt-6"
            >
              <div class="h-6 bg-gray-200 rounded w-48 mb-6"></div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="i in 6" :key="i">
                  <div class="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                  <div class="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="lead">
            <!-- 1. AI Qualification Summary -->
            <div
              class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 flex-shrink-0 relative overflow-hidden transition-all"
            >
              <div
                class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4"
              >
                <h2
                  class="text-[17px] sm:text-[18px] font-bold text-slate-900 flex items-center gap-2"
                >
                  <Bot class="w-5 h-5 text-blue-600" />
                  AI Qualification Summary
                </h2>
                <div class="flex items-center gap-3">
                  <span
                    class="text-[12px] font-bold px-2.5 py-1 rounded bg-[#DBEAFE] text-[#1E40AF]"
                    >Score: {{ lead.lead_score }}/5</span
                  >
                </div>
              </div>

              <div class="space-y-4">
                <div>
                  <label
                    class="block text-[11px] sm:text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1"
                    >Fit Status</label
                  >
                  <p
                    class="text-[13px] sm:text-[14px] text-slate-900 font-medium"
                  >
                    {{ lead.fit_status }}
                  </p>
                </div>

                <div>
                  <label
                    class="block text-[11px] sm:text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1"
                    >Summary</label
                  >
                  <textarea
                    v-if="isEditingSummary"
                    v-model="lead.qualification_summary"
                    class="w-full border border-slate-200 rounded-lg p-3 text-[13px] sm:text-[14px] focus:outline-none focus:ring-1 focus:ring-blue-600 min-h-[100px]"
                  ></textarea>
                  <p
                    v-else
                    class="text-[13px] sm:text-[14px] text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100"
                  >
                    {{ lead.qualification_summary }}
                  </p>
                </div>

                <div>
                  <label
                    class="block text-[11px] sm:text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1"
                    >Recommended Next Action</label
                  >
                  <textarea
                    v-if="isEditingSummary"
                    v-model="lead.recommended_next_action"
                    class="w-full border border-slate-200 rounded-lg p-3 text-[13px] sm:text-[14px] focus:outline-none focus:ring-1 focus:ring-blue-600"
                  ></textarea>
                  <p
                    v-else
                    class="text-[13px] sm:text-[14px] text-blue-600 font-semibold bg-blue-50 p-3 rounded-lg border border-blue-100"
                  >
                    {{ lead.recommended_next_action }}
                  </p>
                </div>

                <div v-if="lead.risk_flags && lead.risk_flags.length > 0">
                  <label
                    class="block text-[11px] sm:text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1"
                    >Risk Flags</label
                  >
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="(flag, index) in lead.risk_flags"
                      :key="index"
                      class="text-[11px] sm:text-[12px] font-medium px-2.5 py-1 rounded bg-red-50 text-red-700 border border-red-200"
                    >
                      {{ flag }}
                    </span>
                  </div>
                </div>

                <div class="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    @click="toggleEditSummary"
                    class="text-[12px] sm:text-[13px] font-semibold text-blue-600 hover:text-blue-800 transition px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg"
                  >
                    {{ isEditingSummary ? "Save Edit" : "Edit AI Output" }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 2. Submitted Form Data -->
            <div
              class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 flex-1 animate-fade-in"
            >
              <h2
                class="text-[17px] sm:text-[18px] font-bold text-slate-900 mb-4"
              >
                Submitted Form Data
              </h2>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1"
                    >Full Name</label
                  >
                  <p class="text-[13px] sm:text-[14px] text-slate-900">
                    {{ lead.full_name }}
                  </p>
                </div>
                <div>
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1"
                    >Email</label
                  ><a
                    :href="`mailto:${lead.email}`"
                    class="text-[13px] sm:text-[14px] text-blue-600 hover:underline break-all"
                    >{{ lead.email }}</a
                  >
                </div>
                <div>
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1"
                    >Phone</label
                  >
                  <p class="text-[13px] sm:text-[14px] text-slate-900">
                    {{ lead.phone }}
                  </p>
                </div>
                <div>
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1"
                    >Company</label
                  >
                  <p class="text-[13px] sm:text-[14px] text-slate-900">
                    {{ lead.company_name }}
                  </p>
                </div>
                <div>
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1"
                    >Country</label
                  >
                  <p class="text-[13px] sm:text-[14px] text-slate-900">
                    {{ lead.country }}
                  </p>
                </div>
                <div>
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1"
                    >Business Type</label
                  >
                  <p class="text-[13px] sm:text-[14px] text-slate-900">
                    {{ lead.business_type }}
                  </p>
                </div>
                <div>
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1"
                    >Company Size</label
                  >
                  <p class="text-[13px] sm:text-[14px] text-slate-900">
                    {{ lead.company_size }}
                  </p>
                </div>
                <div>
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1"
                    >Preferred Contact</label
                  >
                  <p class="text-[13px] sm:text-[14px] text-slate-900">
                    {{ lead.preferred_contact_method }}
                  </p>
                </div>

                <div class="sm:col-span-2">
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1"
                    >Current Problem</label
                  >
                  <p
                    class="text-[13px] sm:text-[14px] text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100"
                  >
                    {{ lead.current_problem }}
                  </p>
                </div>
                <div class="sm:col-span-2">
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1"
                    >Automation Interest</label
                  >
                  <p
                    class="text-[13px] sm:text-[14px] text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100"
                  >
                    {{ lead.automation_interest }}
                  </p>
                </div>
                <div class="sm:col-span-2">
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1"
                    >Message</label
                  >
                  <p
                    class="text-[13px] sm:text-[14px] text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100"
                  >
                    {{ lead.message }}
                  </p>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- KOLOM KANAN (1/3): Aksi, Notes, Log -->
        <div class="flex flex-col gap-6 h-full">
          <template v-if="isLoading">
            <div
              v-for="i in 3"
              :key="'skel-right-' + i"
              class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-pulse"
            >
              <div class="h-5 bg-gray-200 rounded w-32 mb-4"></div>
              <div class="h-10 bg-gray-100 rounded w-full mb-3"></div>
              <div class="h-10 bg-gray-100 rounded w-full"></div>
            </div>
          </template>

          <template v-else-if="lead">
            <!-- 3. Lead Details & Assignment -->
            <div
              class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 flex-shrink-0 animate-fade-in"
            >
              <h2 class="text-[16px] font-bold text-slate-900 mb-4">
                Lead Assignment
              </h2>
              <div class="space-y-3">
                <div>
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1"
                    >Assigned Owner</label
                  >
                  <select
                    v-model="lead.assigned_owner"
                    :disabled="currentUser?.role === 'viewer'"
                    @change="updateOwner"
                    class="w-full text-[13px] sm:text-[14px] border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:opacity-60"
                  >
                    <option value="">Unassigned</option>
                    <option value="AC (Aldean)">AC (Aldean)</option>
                    <option value="JM (Jordan)">JM (Jordan)</option>
                  </select>
                </div>
                <div>
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1"
                    >Next Follow-up</label
                  >
                  <div class="flex flex-col gap-2">
                    <div class="relative group">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8] group-hover:text-[#2563EB] transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      </div>
                      <input
                        type="datetime-local"
                        v-model="tempFollowUpDate"
                        :disabled="currentUser?.role === 'viewer'"
                        class="w-full text-[13px] sm:text-[14px] font-medium text-[#334155] border border-[#E2E8F0] rounded-lg pl-9 pr-2 py-2 bg-[#F8FAFC] hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all cursor-pointer disabled:opacity-60"
                      />
                    </div>
                    <button @click="updateFollowUpDate" :disabled="currentUser?.role === 'viewer'" class="w-full py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-[13px] font-bold rounded-lg transition-colors shadow-sm disabled:opacity-60">
                      Save Schedule
                    </button>
                  </div>
                </div>
                <div>
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1"
                    >Source Tracking</label
                  >
                  <p class="text-[13px] sm:text-[14px] text-slate-900">
                    {{ lead.utm_source || "Direct" }}
                    <span class="text-slate-400"
                      >({{ lead.source_page || "-" }})</span
                    >
                  </p>
                </div>
              </div>
            </div>

            <!-- 4. Add Note -->
            <div
              class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 flex-shrink-0 animate-fade-in"
            >
              <h2 class="text-[16px] font-bold text-slate-900 mb-3">
                Add Internal Note
              </h2>
              <textarea
                v-model="newNote"
                rows="3"
                :disabled="currentUser?.role === 'viewer'"
                placeholder="Tulis catatan internal tentang lead ini..."
                class="w-full text-[13px] sm:text-[14px] border border-blue-600 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-blue-600 resize-none mb-3 disabled:opacity-60"
              ></textarea>
              <button
                @click="submitNote"
                :disabled="!newNote.trim() || currentUser?.role === 'viewer'"
                class="w-full bg-blue-600 text-white text-[13px] font-semibold py-2.5 rounded-lg hover:bg-slate-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan Catatan
              </button>
            </div>

            <!-- 5. Notes History & Activity Log (Digabung agar responsif di HP) -->
            <div
              class="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 flex-1 flex flex-col min-h-[300px] animate-fade-in"
            >
              <h2
                class="text-[16px] font-bold text-slate-900 mb-4 flex-shrink-0"
              >
                Timeline & Notes
              </h2>
              <div
                class="space-y-4 flex-1 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar-vertical"
              >
                <!-- Notes Loop -->
                <div
                  v-for="note in lead.notes"
                  :key="'note-' + note.id"
                  class="bg-slate-50 p-3 rounded-lg border border-slate-100"
                >
                  <p class="text-[13px] text-slate-700 leading-relaxed mb-2">
                    {{ note.note }}
                  </p>
                  <div
                    class="flex items-center justify-between text-[11px] text-slate-400"
                  >
                    <span class="font-medium text-blue-600">{{
                      note.created_by
                    }}</span>
                    <span>{{ formatDate(note.created_at) }}</span>
                  </div>
                </div>

                <!-- Activity Loop -->
                <div
                  class="relative border-l-2 border-slate-200 ml-2 mt-6 space-y-5 pl-5 pb-2"
                >
                  <div
                    v-for="log in lead.activity_logs"
                    :key="'log-' + log.id"
                    class="relative"
                  >
                    <div
                      class="absolute -left-[26px] top-1 w-3.5 h-3.5 rounded-full bg-gray-300 border-2 border-white shadow-sm"
                    ></div>
                    <p
                      class="text-[12px] sm:text-[13px] text-slate-600 font-medium leading-snug"
                    >
                      {{ log.description }}
                    </p>
                    <p class="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                      {{ formatDate(log.created_at) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </main>
  </MainLayout>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.5;
  transition: 0.2s;
  padding: 4px;
  border-radius: 4px;
}
input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
  background-color: #EFF6FF;
}

.custom-scrollbar-vertical::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar-vertical::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar-vertical::-webkit-scrollbar-thumb {
  background-color: #e2e8f0;
  border-radius: 4px;
}
</style>
