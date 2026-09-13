<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from 'vue-router';
import MainLayout from "../components/MainLayout.vue";
import api from "../services/api";
import { useToast } from "../composables/UseToast";
import { Form, Field, ErrorMessage } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { 
  Users, Calendar, DollarSign, List, Search, Download, Plus, Trash2, MoreVertical, SearchX, X
} from '@lucide/vue';

const { showToast } = useToast();
const isLoading = ref(true);

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
  const tierB = leadsData.value.filter(l => l.tier === 'Tier B').length;
  const tierC = leadsData.value.filter(l => l.tier === 'Tier C').length;

  return [
    {
      title: "Total Leads",
      value: total.toString(),
      description: "All active records",
      icon: Users,
    },
    {
      title: "Tier A Leads",
      value: tierA.toString(),
      description: "High-fit accounts",
      icon: List,
    },
    {
      title: "Tier B Leads",
      value: tierB.toString(),
      description: "Medium-fit accounts",
      icon: List,
    },
    {
      title: "Tier C Leads",
      value: tierC.toString(),
      description: "Low-fit accounts",
      icon: List,
    },
  ];
});

// Data Asli dari Backend
const leadsData = ref<Lead[]>([]);

const fetchLeads = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/api/admin/leads');
    if (response.data.success) {
      leadsData.value = response.data.data.map((lead: any) => {
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
          status: lead.status || 'New Lead',
          value: lead.lead_score ? `${lead.lead_score}/5` : '-',
          updated: new Date(lead.updated_at || lead.created_at).toLocaleDateString(),
          isValid: lead.lead_tier !== 'Spam' && lead.lead_tier !== 'Disqualified',
          assigned_owner: lead.assigned_owner || ''
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

const isDeleteModalOpen = ref(false);
const deleteTargetId = ref<string | null>(null);

const deleteSelectedLeads = () => {
  if (selectedLeads.value.length === 0) return;
  deleteTargetId.value = null; // null indicates bulk delete
  isDeleteModalOpen.value = true;
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
  current_problem: "", message: "", status: "New Lead", assigned_owner: ""
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
    status: z.string().optional().or(z.literal('')),
    assigned_owner: z.string().optional().or(z.literal('')),
    current_problem: z.string().max(500, "Text is too long").optional().or(z.literal('')),
    message: z.string().max(500, "Text is too long").optional().or(z.literal(''))
  })
);

const openAddModal = () => {
  editingId.value = null;
  newLead.value = {
    full_name: "", email: "", phone: "", company_name: "", country: "", business_type: "", industry: "",
    role: "", website_url: "", company_size: "", automation_interest: "", preferred_contact_method: "", 
    current_problem: "", message: "", status: "New Lead", assigned_owner: ""
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
    status: lead.status,
    assigned_owner: (lead as any).assigned_owner || ""
  };
  isModalOpen.value = true;
};

const deleteLead = (id: string) => {
  deleteTargetId.value = id;
  isDeleteModalOpen.value = true;
  activeDropdownId.value = null;
};

const confirmDelete = async () => {
  try {
    if (deleteTargetId.value) {
      await api.delete(`/api/leads/${deleteTargetId.value}`);
      showToast("Lead successfully deleted!", "success");
    } else {
      await Promise.all(selectedLeads.value.map(id => api.delete(`/api/leads/${id}`)));
      showToast(`${selectedLeads.value.length} leads successfully deleted!`, "success");
      selectedLeads.value = [];
      if (paginatedLeads.value.length === 0 && currentPage.value > 1) currentPage.value--;
    }
    fetchLeads();
  } catch (error) {
    console.error("Failed to delete lead(s)", error);
    showToast("Failed to delete lead(s).", "error");
  } finally {
    isDeleteModalOpen.value = false;
    deleteTargetId.value = null;
  }
};

const submitForm = async (values: any) => {
  try {
    const payload = {
      ...values,
      lead_tier: values.tier, // Map to DB column if needed
      consent_status: true // Required by backend validation
    };
    
    delete payload.tier; // Fix Prisma error by removing undefined schema column

    if (editingId.value) {
      const updatePayload = {
        status: values.status,
        assigned_owner: values.assigned_owner
      };
      await api.patch(`/api/leads/${editingId.value}`, updatePayload);
      showToast("Lead successfully updated!", "success");
    } else {
      const payload = {
        ...values,
        consent_status: true // Required by backend validation
      };
      // status & assigned_owner are not needed on POST, backend decides default status
      delete payload.status;
      delete payload.assigned_owner;
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

const exportToCSV = async () => {
  try {
    const params = new URLSearchParams();
    if (filterStatus.value) params.append('status', filterStatus.value);
    if (filterTier.value) params.append('tier', filterTier.value);
    if (filterCountry.value) params.append('country', filterCountry.value);
    if (searchQuery.value) params.append('search_keyword', searchQuery.value);

    // Call backend endpoint which returns CSV
    const response = await api.get(`/api/admin/leads/export?${params.toString()}`, { 
      responseType: 'blob' 
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "leads_export.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    showToast("Export successful!", "success");
  } catch (error) {
    console.error("Export failed", error);
    showToast("Failed to export leads.", "error");
  }
};

const closeModal = () => {
  isModalOpen.value = false;
  editingId.value = null;
};

const getTierClass = (tier: string) => {
  switch (tier) {
    case "Tier A": return "bg-[#2563EB] text-white";
    case "Tier B": return "bg-[#6366F1] text-white";
    case "Tier C": return "bg-[#FEF3C7] text-[#D97706]";
    case "Spam": return "bg-[#FEF2F2] text-[#DC2626]";
    default: return "bg-gray-200 text-gray-700";
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "Meeting Requested": case "Demo Scheduled": case "Proposal Sent": return "text-blue-600";
    case "Negotiation": return "text-orange-600";
    case "Won": return "text-green-600";
    case "Lost": case "Disqualified": return "text-red-600";
    default: return "text-slate-900";
  }
};
</script>

<template>
  <div v-if="activeDropdownId" @click="activeDropdownId = null" class="fixed inset-0 z-10"></div>

  <MainLayout active-menu="leads">
    <main class="flex-1 p-8 overflow-y-auto">
      <div class="mb-8">
        <h1 class="text-[32px] font-bold text-slate-900 tracking-tight">Leads Management</h1>
        <p class="text-[16px] text-slate-500 mt-1">All inbound and outbound leads captured by your AI workforce.</p>
      </div>

      <!-- Summary Cards dengan Animasi Fade In -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
        <div v-for="(card, index) in summaryCards" :key="index" class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[13px] font-medium text-slate-500">{{ card.title }}</span>
            <component :is="card.icon" class="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <div class="text-[26px] font-bold text-slate-900 leading-none mb-1.5">{{ card.value }}</div>
            <p class="text-[11px] text-slate-400 font-medium">{{ card.description }}</p>
          </div>
        </div>
      </div>

      <!-- TABS NAVIGATION: Valid vs Invalid -->
      <div class="flex items-center gap-6 mb-4 px-2 border-b border-slate-200">
        <button 
          @click="activeTab = 'valid'"
          class="pb-3 text-[14px] font-bold transition-colors border-b-2"
          :class="activeTab === 'valid' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'"
        >
          Valid Leads
        </button>
        <button 
          @click="activeTab = 'invalid'"
          class="pb-3 text-[14px] font-bold transition-colors border-b-2 flex items-center gap-2"
          :class="activeTab === 'invalid' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'"
        >
          Spam / Invalid
          <span v-if="invalidCount > 0" class="bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[10px] border border-red-100">{{ invalidCount }}</span>
        </button>
        <button 
          @click="activeTab = 'all'"
          class="pb-3 text-[14px] font-bold transition-colors border-b-2"
          :class="activeTab === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'"
        >
          All Data
        </button>
      </div>

      <!-- Table Container dengan Animasi Fade In Default -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative z-20 animate-fade-in">
        
        <!-- Filter Bar Standar -->
        <div v-if="selectedLeads.length === 0" class="p-4 border-b border-slate-200 flex items-center justify-between gap-4 flex-wrap">
          <div class="relative w-64">
            <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input v-model="searchQuery" type="text" placeholder="Search leads, companies..." class="w-full pl-9 pr-3 py-1.5 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600" />
          </div>

          <div class="flex items-center gap-3">
            <select v-model="filterStatus" class="text-[13px] border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none cursor-pointer font-medium text-slate-700">
              <option value="">All status</option>
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

            <select v-model="filterCountry" class="text-[13px] border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none cursor-pointer font-medium text-slate-700">
              <option value="">All countries</option>
              <option value="Australia">Australia</option>
              <option value="Indonesia">Indonesia</option>
              <option value="New Zealand">New Zealand</option>
            </select>

            <select v-model="filterSource" class="text-[13px] border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none cursor-pointer font-medium text-slate-700">
              <option value="">All sources</option>
              <option value="/requestdemo">Request Demo</option>
              <option value="/assessment">Assessment</option>
              <option value="/contact-sales">Contact Sales</option>
              <option value="/waitlist">Waitlist</option>
              <option value="/partner-inquiry">Partner Inquiry</option>
            </select>

            <select v-model="filterTier" class="text-[13px] border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none cursor-pointer font-medium text-slate-700">
              <option value="">All Tiers</option>
              <option value="Tier A">Tier A</option>
              <option value="Tier B">Tier B</option>
              <option value="Tier C">Tier C</option>
            </select>

            <button @click="exportToCSV" class="text-[13px] rounded-lg px-4 py-1.5 border border-slate-200 bg-white text-slate-700 font-medium flex items-center gap-1.5 hover:bg-slate-50 transition shadow-sm">
              <Download class="w-4 h-4" />
              Export CSV
            </button>
            <button @click="openAddModal" class="text-[13px] rounded-lg px-4 py-1.5 bg-blue-600 text-white font-medium flex items-center gap-1 hover:bg-blue-700 transition shadow-sm">
              <Plus class="w-4 h-4" /> Add lead
            </button>
          </div>
        </div>

        <!-- Filter Bar Bulk Actions -->
        <div v-else class="p-4 border-b border-slate-200 bg-blue-50 flex items-center justify-between gap-4 flex-wrap transition-colors">
          <div class="flex items-center gap-3">
            <span class="text-[13px] font-bold text-blue-600 bg-white px-2.5 py-1 rounded-md shadow-sm border border-blue-100">
              {{ selectedLeads.length }} selected
            </span>
            <span class="text-[13px] text-blue-600 font-medium">Choose an action for the selected records.</span>
          </div>
          <div class="flex items-center gap-4">
            <button @click="selectedLeads = []" class="text-[13px] font-bold text-slate-500 hover:text-slate-900 transition">Cancel</button>
            <button @click="deleteSelectedLeads" class="text-[13px] rounded-lg px-4 py-1.5 bg-red-500 text-white font-medium flex items-center gap-1.5 hover:bg-red-600 transition shadow-sm">
              <Trash2 class="w-4 h-4" />
              Delete Selected
            </button>
          </div>
        </div>

        <!-- Table Container -->
        <div class="bg-white overflow-x-auto min-h-75">
          <table class="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50">
                <th class="py-3 px-4 w-12 text-center">
                  <input type="checkbox" class="rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer" :checked="isAllSelected" @change="toggleSelectAll" />
                </th>
                <th class="py-3 px-2 text-[13px] font-bold text-slate-900">Lead</th>
                <th class="py-3 px-2 text-[13px] font-bold text-slate-900">Company</th>
                <th class="py-3 px-2 text-[13px] font-bold text-slate-900 text-center">Country</th>
                <th class="py-3 px-2 text-[13px] font-bold text-slate-900 text-center">Source</th>
                <th class="py-3 px-2 text-[13px] font-bold text-slate-900 text-center">Tier</th>
                <th class="py-3 px-2 text-[13px] font-bold text-slate-900 text-center">Status</th>
                <th class="py-3 px-2 text-[13px] font-bold text-slate-900 text-center">Value</th>
                <th class="py-3 px-4 text-[13px] font-bold text-slate-900 text-right">Updated</th>
                <th class="py-3 px-2 w-10"></th>
              </tr>
            </thead>
            <!-- JIKA SEDANG LOADING (TAMPILKAN SKELETON TABEL) -->
            <tbody v-if="isLoading" class="divide-y divide-[#E2E8F0]">
              <tr v-for="i in 8" :key="'skeleton-'+i">
                <td class="py-3 px-4 text-center"><div class="h-4 bg-gray-200 rounded w-4 mx-auto animate-pulse"></div></td>
                <td class="py-3 px-2">
                  <div class="h-4 bg-gray-200 rounded w-32 mb-1.5 animate-pulse"></div>
                  <div class="h-3 bg-gray-100 rounded w-20 animate-pulse"></div>
                </td>
                <td class="py-3 px-2"><div class="h-4 bg-gray-200 rounded w-28 animate-pulse"></div></td>
                <td class="py-3 px-2 text-center"><div class="h-4 bg-gray-200 rounded w-16 mx-auto animate-pulse"></div></td>
                <td class="py-3 px-2 text-center"><div class="h-4 bg-gray-200 rounded w-16 mx-auto animate-pulse"></div></td>
                <td class="py-3 px-2 text-center"><div class="h-5 bg-gray-200 rounded-md w-16 mx-auto animate-pulse"></div></td>
                <td class="py-3 px-2 text-center"><div class="h-5 bg-gray-200 rounded-md w-20 mx-auto animate-pulse"></div></td>
                <td class="py-3 px-2 text-center"><div class="h-4 bg-gray-200 rounded w-24 mx-auto animate-pulse"></div></td>
                <td class="py-3 px-4 text-right"><div class="h-4 bg-gray-200 rounded w-20 ml-auto animate-pulse"></div></td>
                <td class="py-3 px-2"><div class="h-5 w-5 bg-gray-200 rounded mx-auto animate-pulse"></div></td>
              </tr>
            </tbody>

            <!-- TRICK ANIMASI VUE: Binding atribut key ke activeTab dan currentPage -->
            <tbody v-else :key="activeTab + currentPage" class="animate-fade-in">
              <tr v-for="lead in paginatedLeads" :key="lead.id" @click="handleRowClick(lead)" class="border-b border-gray-100 transition group cursor-pointer hover:bg-gray-50" :class="selectedLeads.includes(lead.id) ? 'bg-[#EFF6FF] hover:bg-[#E0E7FF]' : ''">
                <td class="py-3 px-4 text-center">
                  <input type="checkbox" :value="lead.id" v-model="selectedLeads" @click.stop class="rounded border-slate-300 text-blue-600 focus:ring-blue-600 transition cursor-pointer" :class="selectedLeads.includes(lead.id) ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'" />
                </td>
                <td class="py-3 px-2">
                  <div class="text-[13px] font-medium text-slate-900">{{ lead.name }}</div>
                  <div class="text-[10px] text-slate-500">{{ lead.role }}</div>
                </td>
                <td class="py-3 px-2">
                  <div class="text-[13px] font-medium text-slate-900">{{ lead.company }}</div>
                </td>
                <td class="py-3 px-2 text-center text-[12px] text-slate-500">{{ lead.country }}</td>
                <td class="py-3 px-2 text-center text-[12px] text-slate-500">{{ lead.source }}</td>
                <td class="py-3 px-2 text-center">
                  <span class="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold" :class="getTierClass(lead.tier)">{{ lead.tier }}</span>
                </td>
                <td class="py-3 px-2 text-center">
                  <span class="text-[12px] font-medium" :class="getStatusClass(lead.status)">{{ lead.status }}</span>
                </td>
                <td class="py-3 px-2 text-center text-[12px] text-slate-900 font-medium">{{ lead.value }}</td>
                <td class="py-3 px-4 text-right text-[12px] text-slate-400">{{ lead.updated }}</td>
                <td class="py-3 px-2 text-center relative">
                  <button @click.stop="activeDropdownId = activeDropdownId === lead.id ? null : lead.id" class="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition">
                    <MoreVertical class="w-5 h-5" />
                  </button>
                  <div v-if="activeDropdownId === lead.id" class="absolute right-8 top-10 w-32 bg-white rounded-lg shadow-xl border border-slate-100 z-30 py-1 text-left overflow-hidden">
                    <button @click.stop="openEditModal(lead)" class="w-full px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 text-left transition">Edit</button>
                    <button @click.stop="deleteLead(lead.id)" class="w-full px-4 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 text-left transition">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div v-if="!isLoading && filteredLeads.length === 0" class="py-16 text-center animate-fade-in">
            <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            <p class="text-[14px] text-gray-500 font-medium">No leads found in this category.</p>
          </div>
        </div>

        <!-- Footer Pagination -->
        <div class="p-4 bg-white flex items-center justify-between border-t border-slate-200">
          <div class="text-[14px] text-slate-900 font-medium">{{ paginationText }}</div>
          <div class="flex items-center gap-3">
            <button @click="prevPage" :disabled="currentPage === 1" class="px-5 py-2 border border-slate-300 rounded-lg text-[13px] font-bold text-slate-900 hover:bg-slate-50 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            <button @click="nextPage" :disabled="currentPage === totalPages || totalPages === 0" class="px-7 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>

      <div class="text-center text-[12px] text-blue-600 pt-8 pb-4">© 2026 DDTech. All rights reserved.</div>
    </main>
  </MainLayout>

  <!--CREATE & UPDATE LEAD -->
  <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="closeModal"></div>
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-175 p-8 overflow-y-auto max-h-[90vh] animate-fade-in">
      <div class="flex items-start justify-between mb-6">
        <h2 class="text-[26px] font-bold text-slate-900 tracking-tight leading-none mb-1">{{ editingId ? "Edit lead" : "Add new lead" }}</h2>
        <button @click="closeModal" class="text-slate-400 hover:text-slate-900 transition">
          <X class="w-6 h-6" />
        </button>
      </div>
      <Form :validation-schema="leadSchema" :initial-values="newLead" @submit="submitForm" class="space-y-4" v-slot="{ meta }">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-[13px] font-bold text-black mb-1.5">Full Name</label>
            <Field name="full_name" type="text" :disabled="!!editingId" :class="!!editingId ? 'bg-gray-50' : 'bg-white'" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]" />
            <ErrorMessage name="full_name" class="text-red-500 text-[11px] mt-1 block" />
          </div>
          <div>
            <label class="block text-[13px] font-bold text-black mb-1.5">Email</label>
            <Field name="email" type="email" :disabled="!!editingId" :class="!!editingId ? 'bg-gray-50' : 'bg-white'" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]" />
            <ErrorMessage name="email" class="text-red-500 text-[11px] mt-1 block" />
          </div>
          
          <div>
            <label class="block text-[13px] font-bold text-black mb-1.5">Phone</label>
            <Field name="phone" type="text" :disabled="!!editingId" :class="!!editingId ? 'bg-gray-50' : 'bg-white'" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]" />
            <ErrorMessage name="phone" class="text-red-500 text-[11px] mt-1 block" />
          </div>
          <div>
            <label class="block text-[13px] font-bold text-black mb-1.5">Company Name</label>
            <Field name="company_name" type="text" :disabled="!!editingId" :class="!!editingId ? 'bg-gray-50' : 'bg-white'" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]" />
            <ErrorMessage name="company_name" class="text-red-500 text-[11px] mt-1 block" />
          </div>
          
          <div>
            <label class="block text-[13px] font-bold text-black mb-1.5">Role</label>
            <Field name="role" type="text" :disabled="!!editingId" :class="!!editingId ? 'bg-gray-50' : 'bg-white'" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]" />
            <ErrorMessage name="role" class="text-red-500 text-[11px] mt-1 block" />
          </div>
          <div>
            <label class="block text-[13px] font-bold text-black mb-1.5">Website URL</label>
            <Field name="website_url" type="url" :disabled="!!editingId" :class="!!editingId ? 'bg-gray-50' : 'bg-white'" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]" />
            <ErrorMessage name="website_url" class="text-red-500 text-[11px] mt-1 block" />
          </div>

          <div>
            <label class="block text-[13px] font-bold text-black mb-1.5">Country</label>
            <Field name="country" as="select" :disabled="!!editingId" :class="!!editingId ? 'bg-gray-50' : 'bg-white'" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]">
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
            <Field name="business_type" as="select" :disabled="!!editingId" :class="!!editingId ? 'bg-gray-50' : 'bg-white'" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]">
              <option value="">Select business type</option>
              <option value="B2B">B2B (Business to Business)</option>
              <option value="B2C">B2C (Business to Consumer)</option>
              <option value="B2B2C">B2B2C</option>
            </Field>
            <ErrorMessage name="business_type" class="text-red-500 text-[11px] mt-1 block" />
          </div>

          <div>
            <label class="block text-[13px] font-bold text-black mb-1.5">Industry</label>
            <Field name="industry" type="text" :disabled="!!editingId" :class="!!editingId ? 'bg-gray-50' : 'bg-white'" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]" />
            <ErrorMessage name="industry" class="text-red-500 text-[11px] mt-1 block" />
          </div>
          <div>
            <label class="block text-[13px] font-bold text-black mb-1.5">Company Size</label>
            <Field name="company_size" as="select" :disabled="!!editingId" :class="!!editingId ? 'bg-gray-50' : 'bg-white'" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]">
              <option value="">Select size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="500+">500+ employees</option>
            </Field>
            <ErrorMessage name="company_size" class="text-red-500 text-[11px] mt-1 block" />
          </div>

          <div v-if="editingId">
            <label class="block text-[13px] font-bold text-black mb-1.5">Assigned Owner (Internal)</label>
            <Field name="assigned_owner" as="select" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]">
              <option value="">Unassigned</option>
              <option value="AC (Aldean)">AC (Aldean)</option>
              <option value="JM (Jordan)">JM (Jordan)</option>
            </Field>
            <ErrorMessage name="assigned_owner" class="text-red-500 text-[11px] mt-1 block" />
          </div>
          <div v-if="editingId">
            <label class="block text-[13px] font-bold text-black mb-1.5">Status (Internal)</label>
            <Field name="status" as="select" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]">
              <option value="New Lead">New Lead</option><option value="Qualified">Qualified</option><option value="Contacted">Contacted</option><option value="Meeting Requested">Meeting Requested</option><option value="Demo Scheduled">Demo Scheduled</option><option value="Proposal Sent">Proposal Sent</option><option value="Negotiation">Negotiation</option><option value="Won">Won</option><option value="Lost">Lost</option><option value="Disqualified">Disqualified</option>
            </Field>
            <ErrorMessage name="status" class="text-red-500 text-[11px] mt-1 block" />
          </div>
        </div>

        <div>
          <label class="block text-[13px] font-bold text-black mb-1.5">Current Problem</label>
          <Field name="current_problem" as="textarea" rows="2" :disabled="!!editingId" :class="!!editingId ? 'bg-gray-50' : 'bg-white'" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]" />
          <ErrorMessage name="current_problem" class="text-red-500 text-[11px] mt-1 block" />
        </div>
        <div>
          <label class="block text-[13px] font-bold text-black mb-1.5">Message / Note</label>
          <Field name="message" as="textarea" rows="2" :disabled="!!editingId" :class="!!editingId ? 'bg-gray-50' : 'bg-white'" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px]" />
          <ErrorMessage name="message" class="text-red-500 text-[11px] mt-1 block" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <button type="button" @click="closeModal" class="px-5 py-2 border border-slate-300 rounded-lg text-[14px] font-bold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
          <button type="submit" class="px-5 py-2 bg-blue-600 text-white rounded-lg text-[14px] font-bold hover:bg-blue-700 transition">{{ editingId ? "Save changes" : "Add lead" }}</button>
        </div>
      </Form>
    </div>
  </div>

  <!-- DELETE CONFIRMATION MODAL -->
  <div v-if="isDeleteModalOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-0">
    <div class="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm transition-opacity" @click="isDeleteModalOpen = false"></div>
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center animate-fade-in">
      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Confirm Delete</h3>
      <p class="text-gray-500 text-sm mb-6">
        Are you sure you want to delete {{ deleteTargetId ? 'this lead' : selectedLeads.length + ' selected leads' }}? This action cannot be undone.
      </p>
      <div class="flex items-center gap-3">
        <button @click="isDeleteModalOpen = false" class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition">
          Cancel
        </button>
        <button @click="confirmDelete" class="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition">
          Delete
        </button>
      </div>
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