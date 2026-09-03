<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '../components/MainLayout.vue'
import api from '../services/api'
import { useToast } from '../composables/UseToast'

const route = useRoute();
const router = useRouter();
const { showToast } = useToast();
const leadId = route.params.id;

// ==========================================
// 1. STATE MANAGEMENT
// ==========================================
const lead = ref<any>({
  notes: [],
  activity_logs: []
})
const isLoading = ref(true)
const errorMessage = ref('')
const isEditingSummary = ref(false)
const newNote = ref('')

// ==========================================
// 2. API CALLS
// ==========================================
const fetchLeadDetail = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get(`/api/leads/${leadId}`)
    if (response.data && response.data.success) {
      const data = response.data.data
      
      // Standardize status mapping (same as PipelineView)
      let stageStr = data.status || 'New Lead'
      if (stageStr === 'Demo' || stageStr === 'Demo Booked') stageStr = 'Demo Scheduled'
      if (stageStr === 'Proposal') stageStr = 'Proposal Sent'
      data.status = stageStr
      
      lead.value = data
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

// ==========================================
// 3. UI FUNCTIONS
// ==========================================
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
  
  // Standardize status mapping for backend (same as PipelineView)
  let backendStatus = newStatus
  if (backendStatus === 'Demo Scheduled') backendStatus = 'Demo'
  if (backendStatus === 'Proposal Sent') backendStatus = 'Proposal'

  try {
    await api.patch(`/api/leads/${leadId}`, { status: backendStatus })
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
    await api.post(`/api/leads/${leadId}/notes`, { note: noteText })
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
    await api.patch(`/api/leads/${leadId}`, { assigned_owner: newOwner });
    showToast('Owner berhasil diubah.', 'success');
  } catch (error) {
    console.error('Failed to update owner:', error);
    showToast('Backend API Error: Mock owner diterapkan ke tampilan.', 'info');
  }
};

const updateFollowUpDate = async (event: Event) => {
  const newDate = (event.target as HTMLInputElement).value;
  const isoDate = newDate ? new Date(newDate).toISOString() : null;
  try {
    await api.patch(`/api/leads/${leadId}`, { next_follow_up_at: isoDate });
    lead.value.next_follow_up_at = isoDate;
    showToast('Tanggal follow-up berhasil diubah.', 'success');
  } catch (error) {
    console.error('Failed to update follow-up date:', error);
    lead.value.next_follow_up_at = isoDate;
    showToast('Backend API Error: Mock tanggal diterapkan ke tampilan.', 'info');
  }
};

// ==========================================
// 5. LOGIKA EKSPOR KE CSV (KHUSUS DETAIL)
// ==========================================
const exportDetailToCSV = () => {
  if (!lead.value) return;

  const data = lead.value;

  // Header dan Data Row khusus Lead Detail
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
            class="p-2 rounded-lg border border-[#E2E8F0] bg-white hover:bg-gray-50 transition"
          >
            <svg
              class="w-5 h-5 text-[#64748B]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div>
            <h1
              class="text-[24px] sm:text-[28px] font-bold text-[#0F172A] leading-tight flex items-center gap-3"
            >
              {{ lead.full_name }}
              <span
                class="px-2 py-0.5 text-[11px] font-bold bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] rounded-md"
                >{{ lead.lead_tier }}</span
              >
            </h1>
            <p class="text-[13px] sm:text-[14px] text-[#64748B] mt-1">
              {{ lead.role }} at
              <span class="font-bold text-[#0F172A]">{{
                lead.company_name
              }}</span>
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- TOMBOL EXPORT CSV DETAIL -->
          <button
            @click="exportDetailToCSV"
            class="w-full sm:w-auto px-4 py-2 bg-white border border-[#E2E8F0] text-[#475569] rounded-lg text-[13px] font-bold hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#EFF6FF] shadow-sm transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <svg
              class="w-4 h-4 text-[#94A3B8] group-hover:text-[#2563EB] transition-colors duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <!-- Ikon File Download yang lebih modern -->
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export CSV
          </button>
          <select
            v-model="lead.status"
            @change="updateStatus(($event.target as HTMLSelectElement).value)"
            class="flex-1 sm:flex-none text-[13px] sm:text-[14px] font-semibold border border-[#E2E8F0] rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer"
          >
            <option value="New Lead">New Lead</option>
            <option value="Qualified">Qualified</option>
            <option value="Contacted">Contacted</option>
            <option value="Demo Scheduled">Demo Scheduled</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
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
              class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-8 flex flex-col items-center justify-center min-h-[300px] animate-fade-in relative overflow-hidden"
            >
              <div class="relative w-20 h-20 mb-5 flex items-center justify-center">
                <!-- Ripple Effect -->
                <div class="absolute inset-0 border-4 border-[#7C3AED] rounded-full animate-ping opacity-20"></div>
                <!-- Spinner -->
                <svg class="animate-spin w-12 h-12 text-[#7C3AED]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h3 class="text-[18px] font-bold text-[#0F172A] bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] to-[#7C3AED] mb-2">Atlas AI is working...</h3>
              <p class="text-[14px] text-[#64748B] font-medium animate-pulse">Reading profile & scoring lead</p>
            </div>
            
            <!-- Skeleton for form data -->
            <div
              class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 animate-pulse mt-6"
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
              class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 sm:p-6 flex-shrink-0 relative overflow-hidden transition-all"
            >
              <div
                class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4"
              >
                <h2
                  class="text-[17px] sm:text-[18px] font-bold text-[#0F172A] flex items-center gap-2"
                >
                  <svg
                    class="w-5 h-5 text-[#2563EB]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
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
                    class="block text-[11px] sm:text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-1"
                    >Fit Status</label
                  >
                  <p
                    class="text-[13px] sm:text-[14px] text-[#0F172A] font-medium"
                  >
                    {{ lead.fit_status }}
                  </p>
                </div>

                <div>
                  <label
                    class="block text-[11px] sm:text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-1"
                    >Summary</label
                  >
                  <textarea
                    v-if="isEditingSummary"
                    v-model="lead.qualification_summary"
                    class="w-full border border-[#E2E8F0] rounded-lg p-3 text-[13px] sm:text-[14px] focus:outline-none focus:ring-1 focus:ring-[#2563EB] min-h-[100px]"
                  ></textarea>
                  <p
                    v-else
                    class="text-[13px] sm:text-[14px] text-[#334155] leading-relaxed bg-[#F8FAFC] p-3 rounded-lg border border-[#F1F5F9]"
                  >
                    {{ lead.qualification_summary }}
                  </p>
                </div>

                <div>
                  <label
                    class="block text-[11px] sm:text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-1"
                    >Recommended Next Action</label
                  >
                  <textarea
                    v-if="isEditingSummary"
                    v-model="lead.recommended_next_action"
                    class="w-full border border-[#E2E8F0] rounded-lg p-3 text-[13px] sm:text-[14px] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  ></textarea>
                  <p
                    v-else
                    class="text-[13px] sm:text-[14px] text-[#2563EB] font-semibold bg-[#EFF6FF] p-3 rounded-lg border border-[#DBEAFE]"
                  >
                    {{ lead.recommended_next_action }}
                  </p>
                </div>

                <div v-if="lead.risk_flags && lead.risk_flags.length > 0">
                  <label
                    class="block text-[11px] sm:text-[12px] font-semibold text-[#64748B] uppercase tracking-wider mb-1"
                    >Risk Flags</label
                  >
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="(flag, index) in lead.risk_flags"
                      :key="index"
                      class="text-[11px] sm:text-[12px] font-medium px-2.5 py-1 rounded bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]"
                    >
                      {{ flag }}
                    </span>
                  </div>
                </div>

                <div class="pt-2 border-t border-[#F1F5F9] flex justify-end">
                  <button
                    @click="toggleEditSummary"
                    class="text-[12px] sm:text-[13px] font-semibold text-[#2563EB] hover:text-blue-800 transition px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg"
                  >
                    {{ isEditingSummary ? "Save Edit" : "Edit AI Output" }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 2. Submitted Form Data -->
            <div
              class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 sm:p-6 flex-1 animate-fade-in"
            >
              <h2
                class="text-[17px] sm:text-[18px] font-bold text-[#0F172A] mb-4"
              >
                Submitted Form Data
              </h2>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1"
                    >Full Name</label
                  >
                  <p class="text-[13px] sm:text-[14px] text-[#0F172A]">
                    {{ lead.full_name }}
                  </p>
                </div>
                <div>
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1"
                    >Email</label
                  ><a
                    :href="`mailto:${lead.email}`"
                    class="text-[13px] sm:text-[14px] text-[#2563EB] hover:underline break-all"
                    >{{ lead.email }}</a
                  >
                </div>
                <div>
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1"
                    >Phone</label
                  >
                  <p class="text-[13px] sm:text-[14px] text-[#0F172A]">
                    {{ lead.phone }}
                  </p>
                </div>
                <div>
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1"
                    >Company</label
                  >
                  <p class="text-[13px] sm:text-[14px] text-[#0F172A]">
                    {{ lead.company_name }}
                  </p>
                </div>
                <div>
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1"
                    >Country</label
                  >
                  <p class="text-[13px] sm:text-[14px] text-[#0F172A]">
                    {{ lead.country }}
                  </p>
                </div>
                <div>
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1"
                    >Business Type</label
                  >
                  <p class="text-[13px] sm:text-[14px] text-[#0F172A]">
                    {{ lead.business_type }}
                  </p>
                </div>
                <div>
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1"
                    >Company Size</label
                  >
                  <p class="text-[13px] sm:text-[14px] text-[#0F172A]">
                    {{ lead.company_size }}
                  </p>
                </div>
                <div>
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1"
                    >Preferred Contact</label
                  >
                  <p class="text-[13px] sm:text-[14px] text-[#0F172A]">
                    {{ lead.preferred_contact_method }}
                  </p>
                </div>

                <div class="sm:col-span-2">
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1"
                    >Current Problem</label
                  >
                  <p
                    class="text-[13px] sm:text-[14px] text-[#334155] bg-[#F8FAFC] p-3 rounded-lg border border-[#F1F5F9]"
                  >
                    {{ lead.current_problem }}
                  </p>
                </div>
                <div class="sm:col-span-2">
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1"
                    >Automation Interest</label
                  >
                  <p
                    class="text-[13px] sm:text-[14px] text-[#334155] bg-[#F8FAFC] p-3 rounded-lg border border-[#F1F5F9]"
                  >
                    {{ lead.automation_interest }}
                  </p>
                </div>
                <div class="sm:col-span-2">
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1"
                    >Message</label
                  >
                  <p
                    class="text-[13px] sm:text-[14px] text-[#334155] bg-[#F8FAFC] p-3 rounded-lg border border-[#F1F5F9]"
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
              class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 animate-pulse"
            >
              <div class="h-5 bg-gray-200 rounded w-32 mb-4"></div>
              <div class="h-10 bg-gray-100 rounded w-full mb-3"></div>
              <div class="h-10 bg-gray-100 rounded w-full"></div>
            </div>
          </template>

          <template v-else-if="lead">
            <!-- 3. Lead Details & Assignment -->
            <div
              class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 sm:p-6 flex-shrink-0 animate-fade-in"
            >
              <h2 class="text-[16px] font-bold text-[#0F172A] mb-4">
                Lead Assignment
              </h2>
              <div class="space-y-3">
                <div>
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1"
                    >Assigned Owner</label
                  >
                  <select
                    v-model="lead.assigned_owner"
                    @change="updateOwner"
                    class="w-full text-[13px] sm:text-[14px] border border-[#E2E8F0] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    <option value="">Unassigned</option>
                    <option value="AC (Aldean)">AC (Aldean)</option>
                    <option value="JM (Jordan)">JM (Jordan)</option>
                  </select>
                </div>
                <div>
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1"
                    >Next Follow-up</label
                  >
                  <input
                    type="datetime-local"
                    :value="lead.next_follow_up_at ? new Date(lead.next_follow_up_at).toISOString().slice(0, 16) : ''"
                    @change="updateFollowUpDate"
                    class="w-full text-[13px] sm:text-[14px] border border-[#E2E8F0] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
                <div>
                  <label
                    class="block text-[10px] sm:text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1"
                    >Source Tracking</label
                  >
                  <p class="text-[13px] sm:text-[14px] text-[#0F172A]">
                    {{ lead.utm_source || "Direct" }}
                    <span class="text-[#94A3B8]"
                      >({{ lead.source_page || "-" }})</span
                    >
                  </p>
                </div>
              </div>
            </div>

            <!-- 4. Add Note -->
            <div
              class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 sm:p-6 flex-shrink-0 animate-fade-in"
            >
              <h2 class="text-[16px] font-bold text-[#0F172A] mb-3">
                Add Internal Note
              </h2>
              <textarea
                v-model="newNote"
                rows="3"
                placeholder="Tulis catatan internal tentang lead ini..."
                class="w-full text-[13px] sm:text-[14px] border border-[#2563EB] rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#2563EB] resize-none mb-3"
              ></textarea>
              <button
                @click="submitNote"
                :disabled="!newNote.trim()"
                class="w-full bg-[#2563EB] text-white text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#94A3B8] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan Catatan
              </button>
            </div>

            <!-- 5. Notes History & Activity Log (Digabung agar responsif di HP) -->
            <div
              class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 sm:p-6 flex-1 flex flex-col min-h-[300px] animate-fade-in"
            >
              <h2
                class="text-[16px] font-bold text-[#0F172A] mb-4 flex-shrink-0"
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
                  class="bg-[#F8FAFC] p-3 rounded-lg border border-[#F1F5F9]"
                >
                  <p class="text-[13px] text-[#334155] leading-relaxed mb-2">
                    {{ note.note }}
                  </p>
                  <div
                    class="flex items-center justify-between text-[11px] text-[#94A3B8]"
                  >
                    <span class="font-medium text-[#2563EB]">{{
                      note.created_by
                    }}</span>
                    <span>{{ formatDate(note.created_at) }}</span>
                  </div>
                </div>

                <!-- Activity Loop -->
                <div
                  class="relative border-l-2 border-[#E2E8F0] ml-2 mt-6 space-y-5 pl-5 pb-2"
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
                      class="text-[12px] sm:text-[13px] text-[#475569] font-medium leading-snug"
                    >
                      {{ log.description }}
                    </p>
                    <p class="text-[10px] sm:text-[11px] text-[#94A3B8] mt-0.5">
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
/* CSS Animasi Fade In Seragam dengan halaman lain */
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
