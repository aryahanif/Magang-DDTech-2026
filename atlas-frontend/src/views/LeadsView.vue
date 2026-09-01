<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from 'vue-router';
import MainLayout from "../components/MainLayout.vue";
import api from "../services/api";
import { useToast } from "../composables/UseToast";
import { Form, Field, ErrorMessage } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';

const { showToast } = useToast();
const isLoading = ref(true);

// Cetak Biru Data (Interface)
interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  company: string;
  country: string;
  source: string;
  tier: string;
  status: string;
  value: string;
  updated: string;
  isValid: boolean; 
}

const router = useRouter();
const handleRowClick = (leadData: any) => {
  sessionStorage.setItem('selectedLead', JSON.stringify(leadData))
  router.push(`/admin/leads/${leadData.id}`)
}

// Data Summary (Sekarang dinamis dari Database)
const summaryCards = computed(() => {
  const total = leadsData.value.length;
  const tierA = leadsData.value.filter(l => l.tier === 'Tier A').length;
  const demoReq = leadsData.value.filter(l => l.status === 'Demo' || l.status === 'Demo Booked' || l.status === 'Demo Scheduled').length;
  const pipelineValue = leadsData.value
    .filter(l => l.status !== 'Won' && l.status !== 'Lost')
    .reduce((acc, curr) => acc + (parseInt(curr.value) || 0), 0);
  
  // Format angka ke format mata uang ringkas (contoh: $367.5K)
  const formatValue = (val: number) => {
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val}`;
  };

  return [
    {
      title: "Total Leads",
      value: total.toString(),
      description: "All active records",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    },
    {
      title: "Tier A Leads",
      value: tierA.toString(),
      description: "High-fit accounts",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="#9CA3AF" d="m8.85 16.825l3.15-1.9l3.15 1.925l-.825-3.6l2.775-2.4l-3.65-.325l-1.45-3.4l-1.45 3.375l-3.65.325l2.775 2.425zm3.15-.723l-3.63 2.192q-.16.079-.297.064q-.136-.016-.265-.094q-.13-.08-.196-.226t-.012-.319l.966-4.11l-3.195-2.77q-.135-.11-.178-.263t.019-.293t.165-.23q.104-.087.28-.118l4.216-.368l1.644-3.892q.068-.165.196-.238T12 5.364t.288.073t.195.238l1.644 3.892l4.215.368q.177.03.281.119q.104.088.166.229q.061.14.018.293t-.178.263l-3.195 2.77l.966 4.11q.056.171-.011.318t-.197.226q-.128.08-.265.095q-.136.015-.296-.064zm0-3.852" /></svg>`,
    },
    {
      title: "Demo Request",
      value: demoReq.toString(),
      description: "Scheduled this week",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
    },
    {
      title: "Open Pipeline Value",
      value: formatValue(pipelineValue),
      description: "Excludes won & lost",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    },
  ];
});

// Data Asli dari Backend
const leadsData = ref<Lead[]>([]);

const fetchLeads = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/api/leads');
    if (response.data.success) {
      leadsData.value = response.data.data.map((lead: any) => {
        const stageStr = lead.status || 'New Lead'
        const mappedStatus = stageStr === 'Demo' || stageStr === 'Demo Booked' ? 'Demo Scheduled' :
                             stageStr === 'Proposal' ? 'Proposal Sent' : stageStr;
        return {
          id: lead.id,
          name: lead.full_name || lead.email || 'Unknown',
          email: lead.email || '',
          phone: lead.phone || '',
          role: lead.role || '-',
          company: lead.company_name || '-',
          country: lead.country || '-',
          source: lead.source_page || '-',
          tier: lead.lead_tier || '-',
          status: mappedStatus,
          value: lead.lead_score ? `${lead.lead_score}` : '-',
          updated: new Date(lead.updated_at || lead.created_at).toLocaleDateString(),
          isValid: lead.lead_tier !== 'Spam' && lead.lead_tier !== 'Disqualified'
        }
      });
    }
  } catch (error) {
    console.error("Failed to fetch leads from API", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchLeads();
});

// ==========================================
// LOGIKA TABS & FILTER PENCARIAN
// ==========================================
const activeTab = ref("valid"); 
const searchQuery = ref("");
const filterStatus = ref("");
const filterCountry = ref("");
const filterTier = ref("");
const filterSource = ref("");

const invalidCount = computed(() => leadsData.value.filter(l => !l.isValid).length);

const filteredLeads = computed(() => {
  return leadsData.value.filter((lead) => {
    const matchTab = 
      activeTab.value === 'all' ? true : 
      activeTab.value === 'valid' ? lead.isValid === true : 
      lead.isValid === false;

    const matchSearch =
      lead.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.value.toLowerCase()));
    const matchStatus = filterStatus.value ? lead.status === filterStatus.value : true;
    const matchCountry = filterCountry.value ? lead.country === filterCountry.value : true;
    const matchTier = filterTier.value ? lead.tier === filterTier.value : true;
    const matchSource = filterSource.value ? lead.source === filterSource.value : true;
    
    return matchTab && matchSearch && matchStatus && matchCountry && matchTier && matchSource;
  });
});

// ==========================================
// LOGIKA PAGINASI (HALAMAN)
// ==========================================
const currentPage = ref(1);
const itemsPerPage = 10;

watch([activeTab, searchQuery, filterStatus, filterCountry, filterTier, filterSource], () => {
  currentPage.value = 1; 
});

const totalPages = computed(() => Math.ceil(filteredLeads.value.length / itemsPerPage));

const paginatedLeads = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredLeads.value.slice(start, end);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const paginationText = computed(() => {
  const total = filteredLeads.value.length;
  if (total === 0) return "Showing 0 of 0 Leads";
  const start = (currentPage.value - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage.value * itemsPerPage, total);
  return `Showing ${start}-${end} of ${total} Leads`;
});

// ==========================================
// LOGIKA SELECT ALL & BULK ACTIONS
// ==========================================
const selectedLeads = ref<string[]>([]);

const isAllSelected = computed(
  () => filteredLeads.value.length > 0 && selectedLeads.value.length === filteredLeads.value.length
);

const toggleSelectAll = (event: Event) => {
  const isChecked = (event.target as HTMLInputElement).checked;
  selectedLeads.value = isChecked ? filteredLeads.value.map((lead) => lead.id) : [];
};

const deleteSelectedLeads = () => {
  leadsData.value = leadsData.value.filter((lead) => !selectedLeads.value.includes(lead.id));
  selectedLeads.value = [];
  if (paginatedLeads.value.length === 0 && currentPage.value > 1) currentPage.value--;
};

// ==========================================
// LOGIKA CRUD TUNGGAL & MODAL FORM
// ==========================================
const isModalOpen = ref(false);
const editingId = ref<string | null>(null);
const activeDropdownId = ref<string | null>(null);

const newLead = ref({
  full_name: "", email: "", phone: "", company_name: "", country: "", business_type: "", industry: "",
  role: "", website_url: "", company_size: "", automation_interest: "", preferred_contact_method: "", 
  current_problem: "", message: "", tier: "Tier C", status: "New Lead"
});

const leadSchema = toTypedSchema(
  z.object({
    full_name: z.string({ required_error: "Full name is required" }).min(1, "Full name is required").max(50, "Name is too long").regex(/^[a-zA-Z\s\.,]+$/, "Only letters, spaces, dots, and commas allowed"),
    email: z.string({ required_error: "Email is required" }).min(1, "Email is required").email("Invalid email format").max(50, "Email is too long"),
    phone: z.string().max(15, "Phone number is too long").regex(/^[0-9\+]*$/, "Only numbers and + allowed").optional().or(z.literal('')),
    company_name: z.string({ required_error: "Company name is required" }).min(1, "Company name is required").max(50, "Company name is too long"),
    role: z.string({ required_error: "Role is required" }).min(1, "Role is required").max(50, "Role is too long"),
    website_url: z.string().url("Invalid URL format").max(500, "URL is too long").optional().or(z.literal('')),
    country: z.string().optional().or(z.literal('')),
    business_type: z.string().optional().or(z.literal('')),
    industry: z.string().max(50, "Industry name is too long").optional().or(z.literal('')),
    company_size: z.string().optional().or(z.literal('')),
    tier: z.string().optional().or(z.literal('')),
    status: z.string().optional().or(z.literal('')),
    current_problem: z.string().max(500, "Text is too long").optional().or(z.literal('')),
    message: z.string().max(500, "Text is too long").optional().or(z.literal(''))
  })
);

const openAddModal = () => {
  editingId.value = null;
  newLead.value = {
    full_name: "", email: "", phone: "", company_name: "", country: "", business_type: "", industry: "",
    role: "", website_url: "", company_size: "", automation_interest: "", preferred_contact_method: "", 
    current_problem: "", message: "", tier: "Tier C", status: "New Lead"
  };
  isModalOpen.value = true;
};

const openEditModal = async (lead: Lead) => {
  activeDropdownId.value = null;
  editingId.value = lead.id.toString();
  // Fetch full details from backend if needed, but for now we map what we have or leave blank
  newLead.value = { 
    full_name: lead.name, 
    email: (lead as any).email || "", 
    phone: (lead as any).phone || "", 
    company_name: lead.company, 
    country: lead.country, 
    business_type: (lead as any).business_type || "", 
    industry: (lead as any).industry || "",
    role: lead.role, 
    website_url: (lead as any).website_url || "", 
    company_size: (lead as any).company_size || "", 
    automation_interest: (lead as any).automation_interest || "", 
    preferred_contact_method: (lead as any).preferred_contact_method || "", 
    current_problem: (lead as any).current_problem || "", 
    message: (lead as any).message || "", 
    tier: lead.tier, 
    status: lead.status
  };
  isModalOpen.value = true;
};

const deleteLead = async (id: string) => {
  if (confirm('Are you sure you want to delete this lead?')) {
    try {
      await api.delete(`/api/leads/${id}`);
      showToast("Lead successfully deleted!", "success");
      fetchLeads(); // refresh
    } catch (error) {
      console.error("Failed to delete lead", error);
      showToast("Failed to delete lead.", "error");
    }
  }
  activeDropdownId.value = null;
};

const submitForm = async (values: any) => {
  try {
    const payload = {
      ...values,
      lead_tier: values.tier, // Map to DB column if needed
      consent_status: true // Required by backend validation
    };

    if (editingId.value) {
      await api.patch(`/api/leads/${editingId.value}`, payload);
      showToast("Lead successfully updated!", "success");
    } else {
      await api.post('/api/leads', payload);
      showToast("Lead successfully added!", "success");
    }
    
    closeModal();
    fetchLeads(); // Refresh list after save
  } catch (error) {
    console.error("Failed to save lead", error);
    showToast("Failed to save lead. Please check the console.", "error");
  }
};

const exportToCSV = () => {
  if (filteredLeads.value.length === 0) {
    showToast("No leads to export.", "error");
    return;
  }
  
  const headers = ["Name", "Company", "Email", "Phone", "Country", "Source", "Tier", "Status", "Value", "Updated"];
  const rows = filteredLeads.value.map(lead => [
    lead.name,
    lead.company,
    lead.email,
    lead.phone,
    lead.country,
    lead.source,
    lead.tier,
    lead.status,
    lead.value,
    lead.updated
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(item => `"${(item || '').toString().replace(/"/g, '""')}"`).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "leads_export.csv");
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Export successful!", "success");
};

const closeModal = () => {
  isModalOpen.value = false;
  editingId.value = null;
};

const getTierClass = (tier: string) => {
  switch (tier) {
    case "Tier A": return "bg-[#2563EB] text-white";
    case "Tier B": return "bg-[#94A3B8] text-white";
    case "Tier C": return "bg-[#FEF3C7] text-[#D97706]";
    case "Spam": return "bg-[#FEF2F2] text-[#DC2626]";
    default: return "bg-gray-200 text-gray-700";
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "Demo": case "Proposal": return "text-[#2563EB]";
    case "Won": return "text-[#16A34A]";
    case "Lost": return "text-[#DC2626]";
    default: return "text-[#0F172A]";
  }
};
</script>

<template>
  <div v-if="activeDropdownId" @click="activeDropdownId = null" class="fixed inset-0 z-10"></div>

  <MainLayout active-menu="leads">
    <main class="flex-1 p-8 overflow-y-auto">
      <div class="mb-8">
        <h1 class="text-[32px] font-bold text-[#0F172A] tracking-tight">Leads Management</h1>
        <p class="text-[16px] text-[#64748B] mt-1">All inbound and outbound leads captured by your AI workforce.</p>
      </div>

      <!-- Summary Cards dengan Animasi Fade In -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
        <div v-for="(card, index) in summaryCards" :key="index" class="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[13px] font-medium text-[#64748B]">{{ card.title }}</span>
            <div v-html="card.icon"></div>
          </div>
          <div>
            <div class="text-[26px] font-bold text-[#0F172A] leading-none mb-1.5">{{ card.value }}</div>
            <p class="text-[11px] text-[#94A3B8] font-medium">{{ card.description }}</p>
          </div>
        </div>
      </div>

      <!-- TABS NAVIGATION: Valid vs Invalid -->
      <div class="flex items-center gap-6 mb-4 px-2 border-b border-gray-200">
        <button 
          @click="activeTab = 'valid'"
          class="pb-3 text-[14px] font-bold transition-colors border-b-2"
          :class="activeTab === 'valid' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-gray-500 hover:text-gray-700'"
        >
          Valid Leads
        </button>
        <button 
          @click="activeTab = 'invalid'"
          class="pb-3 text-[14px] font-bold transition-colors border-b-2 flex items-center gap-2"
          :class="activeTab === 'invalid' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
        >
          Spam / Invalid
          <span v-if="invalidCount > 0" class="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px]">{{ invalidCount }}</span>
        </button>
        <button 
          @click="activeTab = 'all'"
          class="pb-3 text-[14px] font-bold transition-colors border-b-2"
          :class="activeTab === 'all' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-gray-500 hover:text-gray-700'"
        >
          All Data
        </button>
      </div>

      <!-- Table Container dengan Animasi Fade In Default -->
      <div class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col relative z-20 animate-fade-in">
        
        <!-- Filter Bar Standar -->
        <div v-if="selectedLeads.length === 0" class="p-4 border-b border-[#E2E8F0] flex items-center justify-between gap-4 flex-wrap">
          <div class="relative w-64">
            <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input v-model="searchQuery" type="text" placeholder="Search leads, companies..." class="w-full pl-9 pr-3 py-1.5 text-[13px] bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]" />
          </div>

          <div class="flex items-center gap-3">
            <select v-model="filterStatus" class="text-[13px] border border-[#E2E8F0] rounded-lg px-3 py-1.5 bg-white focus:outline-none cursor-pointer font-medium">
              <option value="">All status</option>
              <option value="New Lead">New Lead</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Demo">Demo</option>
              <option value="Proposal">Proposal</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>

            <select v-model="filterCountry" class="text-[13px] border border-[#E2E8F0] rounded-lg px-3 py-1.5 bg-white focus:outline-none cursor-pointer font-medium">
              <option value="">All countries</option>
              <option value="Australia">Australia</option>
              <option value="Indonesia">Indonesia</option>
              <option value="New Zealand">New Zealand</option>
            </select>

            <select v-model="filterSource" class="text-[13px] border border-[#E2E8F0] rounded-lg px-3 py-1.5 bg-white focus:outline-none cursor-pointer font-medium">
              <option value="">All sources</option>
              <option value="/requestdemo">Request Demo</option>
              <option value="/assessment">Assessment</option>
              <option value="/contact-sales">Contact Sales</option>
              <option value="/waitlist">Waitlist</option>
              <option value="/partner-inquiry">Partner Inquiry</option>
            </select>

            <select v-model="filterTier" class="text-[13px] border border-[#E2E8F0] rounded-lg px-3 py-1.5 bg-white focus:outline-none cursor-pointer font-medium">
              <option value="">All Tiers</option>
              <option value="Tier A">Tier A</option>
              <option value="Tier B">Tier B</option>
              <option value="Tier C">Tier C</option>
            </select>

            <button @click="exportToCSV" class="text-[13px] rounded-lg px-4 py-1.5 border border-gray-300 bg-white text-gray-700 font-medium flex items-center gap-1.5 hover:bg-gray-50 transition shadow-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export CSV
            </button>
            <button @click="openAddModal" class="text-[13px] rounded-lg px-4 py-1.5 bg-[#2563EB] text-white font-medium flex items-center gap-1 hover:bg-blue-700 transition shadow-sm">
              Add lead +
            </button>
          </div>
        </div>

        <!-- Filter Bar Bulk Actions -->
        <div v-else class="p-4 border-b border-[#E2E8F0] bg-[#EFF6FF] flex items-center justify-between gap-4 flex-wrap transition-colors">
          <div class="flex items-center gap-3">
            <span class="text-[13px] font-bold text-[#2563EB] bg-white px-2.5 py-1 rounded-md shadow-sm border border-blue-100">
              {{ selectedLeads.length }} selected
            </span>
            <span class="text-[13px] text-[#2563EB] font-medium">Choose an action for the selected records.</span>
          </div>
          <div class="flex items-center gap-4">
            <button @click="selectedLeads = []" class="text-[13px] font-bold text-[#64748B] hover:text-[#0F172A] transition">Cancel</button>
            <button @click="deleteSelectedLeads" class="text-[13px] rounded-lg px-4 py-1.5 bg-red-500 text-white font-medium flex items-center gap-1.5 hover:bg-red-600 transition shadow-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Delete Selected
            </button>
          </div>
        </div>

        <!-- Table Container -->
        <div class="bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-visible min-h-75">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-[#E2E8F0] bg-white">
                <th class="py-3 px-4 w-12 text-center">
                  <input type="checkbox" class="rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer" :checked="isAllSelected" @change="toggleSelectAll" />
                </th>
                <th class="py-3 px-2 text-[13px] font-bold text-[#0F172A]">Lead</th>
                <th class="py-3 px-2 text-[13px] font-bold text-[#0F172A]">Company</th>
                <th class="py-3 px-2 text-[13px] font-bold text-[#0F172A] text-center">Country</th>
                <th class="py-3 px-2 text-[13px] font-bold text-[#0F172A] text-center">Source</th>
                <th class="py-3 px-2 text-[13px] font-bold text-[#0F172A] text-center">Tier</th>
                <th class="py-3 px-2 text-[13px] font-bold text-[#0F172A] text-center">Status</th>
                <th class="py-3 px-2 text-[13px] font-bold text-[#0F172A] text-center">Value</th>
                <th class="py-3 px-4 text-[13px] font-bold text-[#0F172A] text-right">Updated</th>
                <th class="py-3 px-2 w-10"></th>
              </tr>
            </thead>
            <!-- TRICK ANIMASI VUE: Binding atribut key ke activeTab dan currentPage -->
            <tbody :key="activeTab + currentPage" class="animate-fade-in">
              <tr v-for="lead in paginatedLeads" :key="lead.id" @click="handleRowClick(lead)" class="border-b border-gray-100 transition group cursor-pointer hover:bg-gray-50" :class="selectedLeads.includes(lead.id) ? 'bg-[#EFF6FF] hover:bg-[#E0E7FF]' : ''">
                <td class="py-3 px-4 text-center">
                  <input type="checkbox" :value="lead.id" v-model="selectedLeads" @click.stop class="rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB] transition cursor-pointer" :class="selectedLeads.includes(lead.id) ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'" />
                </td>
                <td class="py-3 px-2">
                  <div class="text-[13px] font-medium text-[#0F172A]">{{ lead.name }}</div>
                  <div class="text-[10px] text-[#94A3B8]">{{ lead.role }}</div>
                </td>
                <td class="py-3 px-2">
                  <div class="text-[13px] font-medium text-[#0F172A]">{{ lead.company }}</div>
                </td>
                <td class="py-3 px-2 text-center text-[12px] text-[#64748B]">{{ lead.country }}</td>
                <td class="py-3 px-2 text-center text-[12px] text-[#64748B]">{{ lead.source }}</td>
                <td class="py-3 px-2 text-center">
                  <span class="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold" :class="getTierClass(lead.tier)">{{ lead.tier }}</span>
                </td>
                <td class="py-3 px-2 text-center">
                  <span class="text-[12px] font-medium" :class="getStatusClass(lead.status)">{{ lead.status }}</span>
                </td>
                <td class="py-3 px-2 text-center text-[12px] text-[#0F172A] font-medium">{{ lead.value }}</td>
                <td class="py-3 px-4 text-right text-[12px] text-[#94A3B8]">{{ lead.updated }}</td>
                <td class="py-3 px-2 text-center relative">
                  <button @click.stop="activeDropdownId = activeDropdownId === lead.id ? null : lead.id" class="p-1 rounded text-gray-400 hover:text-gray-800 hover:bg-gray-200 transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                  </button>
                  <div v-if="activeDropdownId === lead.id" class="absolute right-8 top-10 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-30 py-1 text-left overflow-hidden">
                    <button @click.stop="openEditModal(lead)" class="w-full px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 text-left transition">Edit</button>
                    <button @click.stop="deleteLead(lead.id)" class="w-full px-4 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 text-left transition">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div v-if="filteredLeads.length === 0" class="py-16 text-center animate-fade-in">
            <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            <p class="text-[14px] text-gray-500 font-medium">No leads found in this category.</p>
          </div>
        </div>

        <!-- Footer Pagination -->
        <div class="p-4 bg-white flex items-center justify-between border-t border-[#E2E8F0]">
          <div class="text-[14px] text-black font-medium">{{ paginationText }}</div>
          <div class="flex items-center gap-3">
            <button @click="prevPage" :disabled="currentPage === 1" class="px-5 py-2 border border-gray-300 rounded-lg text-[13px] font-bold text-black hover:bg-gray-50 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            <button @click="nextPage" :disabled="currentPage === totalPages || totalPages === 0" class="px-7 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>

      <div class="text-center text-[12px] text-[#2563EB] pt-8 pb-4">© 2026 DDTech. All rights reserved.</div>
    </main>
  </MainLayout>

  <!-- MODAL (CREATE & UPDATE LEAD) -->
  <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
    <div class="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm transition-opacity" @click="closeModal"></div>
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-175 p-8 overflow-y-auto max-h-[90vh] animate-fade-in">
      <div class="mb-6">
        <h2 class="text-[26px] font-bold text-black tracking-tight leading-none mb-1">{{ editingId ? "Edit lead" : "Add new lead" }}</h2>
      </div>
      <Form :validation-schema="leadSchema" :initial-values="newLead" @submit="submitForm" class="space-y-4" v-slot="{ meta }">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-[13px] font-bold text-black mb-1.5">Full Name</label>
            <Field name="full_name" type="text" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]" />
            <ErrorMessage name="full_name" class="text-red-500 text-[11px] mt-1 block" />
          </div>
          <div>
            <label class="block text-[13px] font-bold text-black mb-1.5">Email</label>
            <Field name="email" type="email" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]" />
            <ErrorMessage name="email" class="text-red-500 text-[11px] mt-1 block" />
          </div>
          
          <div>
            <label class="block text-[13px] font-bold text-black mb-1.5">Phone</label>
            <Field name="phone" type="text" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]" />
            <ErrorMessage name="phone" class="text-red-500 text-[11px] mt-1 block" />
          </div>
          <div>
            <label class="block text-[13px] font-bold text-black mb-1.5">Company Name</label>
            <Field name="company_name" type="text" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]" />
            <ErrorMessage name="company_name" class="text-red-500 text-[11px] mt-1 block" />
          </div>
          
          <div>
            <label class="block text-[13px] font-bold text-black mb-1.5">Role</label>
            <Field name="role" type="text" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]" />
            <ErrorMessage name="role" class="text-red-500 text-[11px] mt-1 block" />
          </div>
          <div>
            <label class="block text-[13px] font-bold text-black mb-1.5">Website URL</label>
            <Field name="website_url" type="url" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]" />
            <ErrorMessage name="website_url" class="text-red-500 text-[11px] mt-1 block" />
          </div>

          <div>
            <label class="block text-[13px] font-bold text-black mb-1.5">Country</label>
            <Field name="country" as="select" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]">
              <option value="">Select country</option>
              <option value="australia">Australia</option>
              <option value="newzealand">New Zealand</option>
              <option value="Indonesia">Indonesia</option>
              <option value="Other">Other</option>
            </Field>
            <ErrorMessage name="country" class="text-red-500 text-[11px] mt-1 block" />
          </div>
          <div>
            <label class="block text-[13px] font-bold text-black mb-1.5">Business Type</label>
            <Field name="business_type" as="select" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]">
              <option value="">Select business type</option>
              <option value="B2B">B2B (Business to Business)</option>
              <option value="B2C">B2C (Business to Consumer)</option>
              <option value="B2B2C">B2B2C</option>
            </Field>
            <ErrorMessage name="business_type" class="text-red-500 text-[11px] mt-1 block" />
          </div>

          <div>
            <label class="block text-[13px] font-bold text-black mb-1.5">Industry</label>
            <Field name="industry" type="text" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]" />
            <ErrorMessage name="industry" class="text-red-500 text-[11px] mt-1 block" />
          </div>
          <div>
            <label class="block text-[13px] font-bold text-black mb-1.5">Company Size</label>
            <Field name="company_size" as="select" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]">
              <option value="">Select size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="500+">500+ employees</option>
            </Field>
            <ErrorMessage name="company_size" class="text-red-500 text-[11px] mt-1 block" />
          </div>

          <div>
            <label class="block text-[13px] font-bold text-black mb-1.5">Tier (Internal)</label>
            <Field name="tier" as="select" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]">
              <option value="Tier A">Tier A</option><option value="Tier B">Tier B</option><option value="Tier C">Tier C</option>
            </Field>
            <ErrorMessage name="tier" class="text-red-500 text-[11px] mt-1 block" />
          </div>
          <div>
            <label class="block text-[13px] font-bold text-black mb-1.5">Status (Internal)</label>
            <Field name="status" as="select" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]">
              <option value="New Lead">New Lead</option><option value="Qualified">Qualified</option><option value="Contacted">Contacted</option><option value="Demo">Demo</option><option value="Proposal">Proposal</option><option value="Won">Won</option><option value="Lost">Lost</option>
            </Field>
            <ErrorMessage name="status" class="text-red-500 text-[11px] mt-1 block" />
          </div>
        </div>

        <div>
          <label class="block text-[13px] font-bold text-black mb-1.5">Current Problem</label>
          <Field name="current_problem" as="textarea" rows="2" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]" />
          <ErrorMessage name="current_problem" class="text-red-500 text-[11px] mt-1 block" />
        </div>
        <div>
          <label class="block text-[13px] font-bold text-black mb-1.5">Message / Note</label>
          <Field name="message" as="textarea" rows="2" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]" />
          <ErrorMessage name="message" class="text-red-500 text-[11px] mt-1 block" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
          <button type="button" @click="closeModal" class="px-5 py-2 border border-gray-300 rounded-lg text-[14px] font-bold hover:bg-gray-50 transition">Cancel</button>
          <button type="submit" class="px-5 py-2 bg-[#2563EB] text-white rounded-lg text-[14px] font-bold hover:bg-blue-700 transition">{{ editingId ? "Save changes" : "Add lead" }}</button>
        </div>
      </Form>
    </div>
  </div>
</template>

<style scoped>
/* CSS Animasi Fade In */
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
</style>