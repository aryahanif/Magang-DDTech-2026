<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import MainLayout from "../components/MainLayout.vue";
import { useToast } from "../composables/UseToast.ts";

const { showToast } = useToast();
const isLoading = ref(true);

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 1500);
});

interface Lead {
  id: number;
  name: string;
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
  sessionStorage.setItem("selectedLead", JSON.stringify(leadData));
  router.push(`/admin/leads/${leadData.id}`);
};

// Data Summary
const summaryCards = [
  {
    title: "Total Leads",
    value: "12",
    description: "All active records",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  },
  {
    title: "Tier A Leads",
    value: "6",
    description: "High-fit accounts",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="#9CA3AF" d="m8.85 16.825l3.15-1.9l3.15 1.925l-.825-3.6l2.775-2.4l-3.65-.325l-1.45-3.4l-1.45 3.375l-3.65.325l2.775 2.425zm3.15-.723l-3.63 2.192q-.16.079-.297.064q-.136-.016-.265-.094q-.13-.08-.196-.226t-.012-.319l.966-4.11l-3.195-2.77q-.135-.11-.178-.263t.019-.293t.165-.23q.104-.087.28-.118l4.216-.368l1.644-3.892q.068-.165.196-.238T12 5.364t.288.073t.195.238l1.644 3.892l4.215.368q.177.03.281.119q.104.088.166.229q.061.14.018.293t-.178.263l-3.195 2.77l.966 4.11q.056.171-.011.318t-.197.226q-.128.08-.265.095q-.136.015-.296-.064zm0-3.852" /></svg>`,
  },
  {
    title: "Demo Request",
    value: "2",
    description: "Scheduled this week",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
  },
  {
    title: "Open Pipeline Value",
    value: "$367.5K",
    description: "Excludes won & lost",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  },
];

const leadsData = ref<Lead[]>([
  {
    id: 1,
    name: "Sarah",
    role: "Head of Ops",
    company: "Meridian Logistics",
    country: "Australia",
    source: "Website",
    tier: "Tier A",
    status: "Demo",
    value: "Value",
    updated: "2h ago",
    isValid: true,
  },
  {
    id: 2,
    name: "Anton",
    role: "COO",
    company: "Kowhai Health",
    country: "New Zealand",
    source: "Referral",
    tier: "Tier B",
    status: "Proposal",
    value: "60k",
    updated: "4h ago",
    isValid: true,
  },
  {
    id: 3,
    name: "Budi",
    role: "VP Customer",
    company: "Nusantara Pay",
    country: "Indonesia",
    source: "LinkedIn",
    tier: "Tier B",
    status: "Qualified",
    value: "60k",
    updated: "6h ago",
    isValid: true,
  },
  {
    id: 4,
    name: "Michael",
    role: "Director of CX",
    company: "Southbank Retail",
    country: "New Zealand",
    source: "Outbound",
    tier: "Tier A",
    status: "Contacted",
    value: "34k",
    updated: "Yesterday",
    isValid: true,
  },
  {
    id: 5,
    name: "Kevin",
    role: "Founder",
    company: "Tuia Studio",
    country: "New Zealand",
    source: "Website",
    tier: "Tier C",
    status: "New Lead",
    value: "21.5k",
    updated: "2d ago",
    isValid: true,
  },
  {
    id: 6,
    name: "Amelia",
    role: "Head Of Support",
    company: "Garuda Flight",
    country: "Indonesia",
    source: "Partner",
    tier: "Tier B",
    status: "Demo",
    value: "12k",
    updated: "Yesterday",
    isValid: true,
  },
  {
    id: 7,
    name: "Putri",
    role: "CTO",
    company: "Haliburton",
    country: "Indonesia",
    source: "Event",
    tier: "Tier A",
    status: "Qualified",
    value: "50k",
    updated: "2d ago",
    isValid: true,
  },
  {
    id: 8,
    name: "Siti",
    role: "Supervisor",
    company: "Bandung Textiles",
    country: "Indonesia",
    source: "LinkedIn",
    tier: "Tier B",
    status: "Won",
    value: "110k",
    updated: "3 days ago",
    isValid: true,
  },
  {
    id: 9,
    name: "Chloe",
    role: "COO",
    company: "PT Astra",
    country: "Indonesia",
    source: "Outbound",
    tier: "Tier C",
    status: "Lost",
    value: "12k",
    updated: "4d ago",
    isValid: true,
  },
  {
    id: 10,
    name: "Jason",
    role: "GM Commercial",
    company: "Perth Marine",
    country: "Australia",
    source: "Referral",
    tier: "Tier A",
    status: "Contacted",
    value: "17k",
    updated: "5d ago",
    isValid: true,
  },
  {
    id: 11,
    name: "Mickey Mouse",
    role: "Test",
    company: "Disney",
    country: "Australia",
    source: "Website",
    tier: "Tier C",
    status: "New Lead",
    value: "-",
    updated: "1h ago",
    isValid: false,
  },
  {
    id: 12,
    name: "hsdjkfhk",
    role: "-",
    company: "asdfg",
    country: "Indonesia",
    source: "Website",
    tier: "Tier C",
    status: "New Lead",
    value: "-",
    updated: "2h ago",
    isValid: false,
  },
]);

const activeTab = ref("valid");
const searchQuery = ref("");
const filterStatus = ref("");
const filterCountry = ref("");
const filterTier = ref("");

const invalidCount = computed(
  () => leadsData.value.filter((l) => !l.isValid).length,
);

const filteredLeads = computed(() => {
  return leadsData.value.filter((lead) => {
    const matchTab =
      activeTab.value === "all"
        ? true
        : activeTab.value === "valid"
          ? lead.isValid === true
          : lead.isValid === false;
    const matchSearch =
      lead.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchStatus = filterStatus.value
      ? lead.status === filterStatus.value
      : true;
    const matchCountry = filterCountry.value
      ? lead.country === filterCountry.value
      : true;
    const matchTier = filterTier.value ? lead.tier === filterTier.value : true;
    return matchTab && matchSearch && matchStatus && matchCountry && matchTier;
  });
});

const currentPage = ref(1);
const itemsPerPage = 10;

watch([activeTab, searchQuery, filterStatus, filterCountry, filterTier], () => {
  currentPage.value = 1;
});

const totalPages = computed(() =>
  Math.ceil(filteredLeads.value.length / itemsPerPage),
);
const paginatedLeads = computed(() =>
  filteredLeads.value.slice(
    (currentPage.value - 1) * itemsPerPage,
    currentPage.value * itemsPerPage,
  ),
);

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

const selectedLeads = ref<number[]>([]);
const isAllSelected = computed(
  () =>
    filteredLeads.value.length > 0 &&
    selectedLeads.value.length === filteredLeads.value.length,
);
const toggleSelectAll = (event: Event) => {
  selectedLeads.value = (event.target as HTMLInputElement).checked
    ? filteredLeads.value.map((l) => l.id)
    : [];
};

const deleteSelectedLeads = () => {
  const count = selectedLeads.value.length;
  leadsData.value = leadsData.value.filter(
    (lead) => !selectedLeads.value.includes(lead.id),
  );
  selectedLeads.value = [];
  if (paginatedLeads.value.length === 0 && currentPage.value > 1)
    currentPage.value--;
  showToast(`${count} data lead terpilih berhasil dihapus.`, "success");
};

// ==========================================
// LOGIKA EKSPOR KE CSV
// ==========================================
const exportToCSV = (data: Lead[], filename: string) => {
  if (data.length === 0) {
    showToast("Tidak ada data untuk diekspor.", "error");
    return;
  }
  const headers = [
    "ID",
    "Name",
    "Role",
    "Company",
    "Country",
    "Source",
    "Tier",
    "Status",
    "Value",
    "Last Updated",
  ];
  const csvRows = data.map((lead) => {
    return [
      lead.id,
      `"${lead.name}"`,
      `"${lead.role}"`,
      `"${lead.company}"`,
      `"${lead.country}"`,
      `"${lead.source}"`,
      `"${lead.tier}"`,
      `"${lead.status}"`,
      `"${lead.value}"`,
      `"${lead.updated}"`,
    ].join(",");
  });

  const csvContent = [headers.join(","), ...csvRows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast(`${data.length} data berhasil diekspor ke CSV.`, "success");
};

const exportFilteredLeads = () => {
  exportToCSV(filteredLeads.value, "Atlas_Leads_Report.csv");
};

const exportSelectedLeads = () => {
  const selectedData = leadsData.value.filter((lead) =>
    selectedLeads.value.includes(lead.id),
  );
  exportToCSV(selectedData, "Atlas_Selected_Leads.csv");
};

// ==========================================
// LOGIKA CRUD TUNGGAL & MODAL FORM
// ==========================================
const isModalOpen = ref(false);
const editingId = ref<number | null>(null);
const activeDropdownId = ref<number | null>(null);

const newLead = ref({
  name: "",
  role: "",
  company: "",
  country: "Australia",
  source: "Website",
  tier: "Tier A",
  status: "Proposal",
  value: "",
});

const openAddModal = () => {
  editingId.value = null;
  newLead.value = {
    name: "",
    role: "",
    company: "",
    country: "Australia",
    source: "Website",
    tier: "Tier A",
    status: "Proposal",
    value: "",
  };
  isModalOpen.value = true;
};
const openEditModal = (lead: Lead) => {
  activeDropdownId.value = null;
  editingId.value = lead.id;
  newLead.value = {
    name: lead.name,
    role: lead.role,
    company: lead.company,
    country: lead.country,
    source: lead.source,
    tier: lead.tier,
    status: lead.status,
    value: lead.value,
  };
  isModalOpen.value = true;
};

const deleteLead = (id: number) => {
  leadsData.value = leadsData.value.filter((l) => l.id !== id);
  activeDropdownId.value = null;
  selectedLeads.value = selectedLeads.value.filter((selId) => selId !== id);
  if (paginatedLeads.value.length === 0 && currentPage.value > 1)
    currentPage.value--;
  showToast("Data lead berhasil dihapus secara permanen.", "success");
};

const submitForm = () => {
  if (editingId.value) {
    const index = leadsData.value.findIndex((l) => l.id === editingId.value);
    if (index !== -1) {
      // 1. Simpan ke dalam variabel agar TypeScript aman
      const oldData = leadsData.value[index];

      // 2. Bungkus dengan pengecekan if (oldData)
      if (oldData) {
        leadsData.value.splice(index, 1, {
          id: oldData.id,
          isValid: oldData.isValid,
          name: newLead.value.name,
          role: newLead.value.role || "-",
          company: newLead.value.company,
          country: newLead.value.country,
          source: newLead.value.source,
          tier: newLead.value.tier,
          status: newLead.value.status,
          value: newLead.value.value,
          updated: "Just now",
        });
        showToast("Perubahan data lead berhasil disimpan.", "success");
      }
    }
  } else {
    const newId = leadsData.value.length
      ? Math.max(...leadsData.value.map((l) => l.id)) + 1
      : 1;
    leadsData.value.unshift({
      id: newId,
      name: newLead.value.name || "Unknown",
      role: newLead.value.role || "-",
      company: newLead.value.company || "-",
      country: newLead.value.country,
      source: newLead.value.source,
      tier: newLead.value.tier,
      status: newLead.value.status,
      value: newLead.value.value || "-",
      updated: "Just now",
      isValid: true,
    });
    showToast("Lead baru berhasil ditambahkan ke database.", "success");
  }
  closeModal();
};

const closeModal = () => {
  isModalOpen.value = false;
  editingId.value = null;
};

const getTierClass = (tier: string) => {
  switch (tier) {
    case "Tier A":
      return "bg-[#2563EB] text-white";
    case "Tier B":
      return "bg-[#94A3B8] text-white";
    case "Tier C":
      return "bg-[#CBD5E1] text-[#475569]";
    default:
      return "bg-gray-200 text-gray-700";
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "Demo":
    case "Proposal":
      return "text-[#2563EB]";
    case "Won":
      return "text-[#16A34A]";
    case "Lost":
      return "text-[#DC2626]";
    default:
      return "text-[#0F172A]";
  }
};
</script>

<template>
  <div
    v-if="activeDropdownId"
    @click="activeDropdownId = null"
    class="fixed inset-0 z-10"
  ></div>

  <MainLayout active-menu="leads">
    <main class="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto w-full max-w-full">
      <div class="mb-6 sm:mb-8">
        <h1
          class="text-[24px] sm:text-[32px] font-bold text-[#0F172A] tracking-tight"
        >
          Leads Management
        </h1>
        <p class="text-[13px] sm:text-[16px] text-[#64748B] mt-1">
          All inbound and outbound leads captured by your AI workforce.
        </p>
      </div>

      <!-- SUMMARY CARDS -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 animate-fade-in"
      >
        <template v-if="isLoading">
          <div
            v-for="i in 4"
            :key="'skel-card-' + i"
            class="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col justify-between animate-pulse"
          >
            <div class="flex items-center justify-between mb-4">
              <div class="h-3 bg-gray-200 rounded w-20"></div>
              <div class="h-5 w-5 bg-gray-200 rounded-full"></div>
            </div>
            <div>
              <div class="h-6 bg-gray-300 rounded w-12 mb-2"></div>
              <div class="h-2.5 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </template>
        <template v-else>
          <div
            v-for="(card, index) in summaryCards"
            :key="index"
            class="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col justify-between"
          >
            <div class="flex items-center justify-between">
              <span
                class="text-[12px] sm:text-[13px] font-medium text-[#64748B]"
                >{{ card.title }}</span
              >
              <div v-html="card.icon"></div>
            </div>
            <div class="mt-2">
              <div
                class="text-[22px] sm:text-[26px] font-bold text-[#0F172A] leading-none mb-1.5"
              >
                {{ card.value }}
              </div>
              <p class="text-[10px] sm:text-[11px] text-[#94A3B8] font-medium">
                {{ card.description }}
              </p>
            </div>
          </div>
        </template>
      </div>

      <!-- TABS NAVIGATION -->
      <div
        class="flex items-center gap-4 sm:gap-6 mb-4 px-1 border-b border-gray-200 overflow-x-auto whitespace-nowrap custom-scrollbar"
      >
        <button
          @click="activeTab = 'valid'"
          class="pb-3 text-[13px] sm:text-[14px] font-bold transition-colors border-b-2 flex-shrink-0"
          :class="
            activeTab === 'valid'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          "
        >
          Valid Leads
        </button>
        <button
          @click="activeTab = 'invalid'"
          class="pb-3 text-[13px] sm:text-[14px] font-bold transition-colors border-b-2 flex items-center gap-1.5 flex-shrink-0"
          :class="
            activeTab === 'invalid'
              ? 'border-red-500 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          "
        >
          Spam / Invalid<span
            v-if="invalidCount > 0 && !isLoading"
            class="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px]"
            >{{ invalidCount }}</span
          >
        </button>
        <button
          @click="activeTab = 'all'"
          class="pb-3 text-[13px] sm:text-[14px] font-bold transition-colors border-b-2 flex-shrink-0"
          :class="
            activeTab === 'all'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          "
        >
          All Data
        </button>
      </div>

      <!-- Table Container -->
      <div
        class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col relative z-20 animate-fade-in"
      >
        <!-- Filter Bar Standar -->
        <div
          v-if="selectedLeads.length === 0"
          class="p-3 sm:p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div class="relative w-full sm:w-64">
            <svg
              class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search leads, companies..."
              class="w-full pl-9 pr-3 py-2 text-[13px] bg-[#F8FAFC] sm:bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <select
              v-model="filterStatus"
              class="flex-1 sm:flex-none text-[12px] sm:text-[13px] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 bg-white focus:outline-none cursor-pointer font-medium"
            >
              <option value="">All status</option>
              <option value="New Lead">New Lead</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Demo">Demo</option>
              <option value="Proposal">Proposal</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
            <select
              v-model="filterCountry"
              class="flex-1 sm:flex-none text-[12px] sm:text-[13px] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 bg-white focus:outline-none cursor-pointer font-medium"
            >
              <option value="">All countries</option>
              <option value="Australia">Australia</option>
              <option value="Indonesia">Indonesia</option>
              <option value="New Zealand">New Zealand</option>
            </select>
            <select
              v-model="filterTier"
              class="flex-1 sm:flex-none text-[12px] sm:text-[13px] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 bg-white focus:outline-none cursor-pointer font-medium"
            >
              <option value="">All Tiers</option>
              <option value="Tier A">Tier A</option>
              <option value="Tier B">Tier B</option>
              <option value="Tier C">Tier C</option>
            </select>

            <button
              @click="openAddModal"
              class="w-full sm:w-auto text-[13px] rounded-lg px-3.5 py-1.5 bg-[#2563EB] text-white font-medium flex items-center justify-center gap-1 hover:bg-blue-700 transition shadow-sm mt-1 sm:mt-0"
            >
              Add lead +
            </button>
            <button
              @click="exportFilteredLeads"
              class="w-full sm:w-auto text-[13px] rounded-lg px-4 py-1.5 bg-white border border-[#E2E8F0] text-[#475569] font-bold flex items-center justify-center gap-2 hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-all duration-200 shadow-sm mt-1 sm:mt-0 group"
            >
              <svg
                class="w-4 h-4 text-[#94A3B8] group-hover:text-[#2563EB] transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export All
            </button>
          </div>
        </div>

        <!-- Filter Bar Bulk Actions -->
        <div
          v-else
          class="p-3 sm:p-4 border-b border-[#E2E8F0] bg-[#EFF6FF] flex items-center justify-between gap-3 flex-wrap transition-colors"
        >
          <div class="flex items-center gap-2">
            <span
              class="text-[12px] font-bold text-[#2563EB] bg-white px-2 py-0.5 rounded shadow-sm border border-blue-100"
              >{{ selectedLeads.length }} selected</span
            >
            <span
              class="hidden sm:inline text-[13px] text-[#2563EB] font-medium"
              >Choose an action for the selected records.</span
            >
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="selectedLeads = []"
              class="text-[12px] font-bold text-[#64748B] hover:text-[#0F172A] transition"
            >
              Cancel
            </button>
            <button
              @click="exportSelectedLeads"
              class="text-[12px] rounded-lg px-3 py-1.5 bg-white border border-[#CBD5E1] text-[#475569] font-medium flex items-center gap-1.5 hover:bg-gray-50 transition shadow-sm"
            >
              <svg
                class="w-4 h-4 hidden sm:block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export
            </button>
            <button
              @click="deleteSelectedLeads"
              class="text-[12px] rounded-lg px-3 py-1.5 bg-red-500 text-white font-medium flex items-center gap-1.5 hover:bg-red-600 transition shadow-sm"
            >
              <svg
                class="w-4 h-4 hidden sm:block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          </div>
        </div>

        <!-- TAMPILAN DESKTOP (TABLE VIEW) -->
        <div class="hidden md:block overflow-x-auto min-h-[300px]">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-[#E2E8F0] bg-white">
                <th class="py-3 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    class="rounded border-gray-300 text-[#2563EB] cursor-pointer"
                    :checked="isAllSelected && filteredLeads.length > 0"
                    @change="toggleSelectAll"
                  />
                </th>
                <th class="py-3 px-2 text-[13px] font-bold text-[#0F172A]">
                  Lead
                </th>
                <th class="py-3 px-2 text-[13px] font-bold text-[#0F172A]">
                  Company
                </th>
                <th
                  class="py-3 px-2 text-[13px] font-bold text-[#0F172A] text-center"
                >
                  Country
                </th>
                <th
                  class="py-3 px-2 text-[13px] font-bold text-[#0F172A] text-center"
                >
                  Source
                </th>
                <th
                  class="py-3 px-2 text-[13px] font-bold text-[#0F172A] text-center"
                >
                  Tier
                </th>
                <th
                  class="py-3 px-2 text-[13px] font-bold text-[#0F172A] text-center"
                >
                  Status
                </th>
                <th
                  class="py-3 px-2 text-[13px] font-bold text-[#0F172A] text-center"
                >
                  Value
                </th>
                <th
                  class="py-3 px-4 text-[13px] font-bold text-[#0F172A] text-right"
                >
                  Updated
                </th>
                <th class="py-3 px-2 w-10"></th>
              </tr>
            </thead>
            <tbody v-if="isLoading" class="divide-y divide-gray-100">
              <tr v-for="i in 5" :key="'skel-tr-' + i">
                <td class="py-3 px-4 text-center">
                  <div
                    class="h-4 w-4 bg-gray-200 rounded mx-auto animate-pulse"
                  ></div>
                </td>
                <td class="py-3 px-2">
                  <div
                    class="h-4 bg-gray-300 rounded w-24 mb-1.5 animate-pulse"
                  ></div>
                  <div
                    class="h-2.5 bg-gray-200 rounded w-16 animate-pulse"
                  ></div>
                </td>
                <td class="py-3 px-2">
                  <div class="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </td>
                <td class="py-3 px-2 text-center">
                  <div
                    class="h-4 bg-gray-200 rounded w-16 mx-auto animate-pulse"
                  ></div>
                </td>
                <td class="py-3 px-2 text-center">
                  <div
                    class="h-4 bg-gray-200 rounded w-16 mx-auto animate-pulse"
                  ></div>
                </td>
                <td class="py-3 px-2 text-center">
                  <div
                    class="h-5 bg-gray-200 rounded w-12 mx-auto animate-pulse"
                  ></div>
                </td>
                <td class="py-3 px-2 text-center">
                  <div
                    class="h-4 bg-gray-200 rounded w-16 mx-auto animate-pulse"
                  ></div>
                </td>
                <td class="py-3 px-2 text-center">
                  <div
                    class="h-4 bg-gray-300 rounded w-12 mx-auto animate-pulse"
                  ></div>
                </td>
                <td class="py-3 px-4 text-right">
                  <div
                    class="h-3 bg-gray-200 rounded w-16 ml-auto animate-pulse"
                  ></div>
                </td>
                <td class="py-3 px-2 text-center">
                  <div
                    class="h-5 w-5 bg-gray-200 rounded mx-auto animate-pulse"
                  ></div>
                </td>
              </tr>
            </tbody>
            <tbody
              v-else
              :key="activeTab + currentPage"
              class="animate-fade-in divide-y divide-gray-100"
            >
              <tr
                v-for="lead in paginatedLeads"
                :key="lead.id"
                @click="handleRowClick(lead)"
                class="transition group cursor-pointer hover:bg-gray-50"
                :class="
                  selectedLeads.includes(lead.id)
                    ? 'bg-[#EFF6FF] hover:bg-[#E0E7FF]'
                    : ''
                "
              >
                <td class="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    :value="lead.id"
                    v-model="selectedLeads"
                    @click.stop
                    class="rounded border-gray-300 text-[#2563EB] cursor-pointer"
                    :class="
                      selectedLeads.includes(lead.id)
                        ? 'opacity-100'
                        : 'opacity-50 group-hover:opacity-100'
                    "
                  />
                </td>
                <td class="py-3 px-2">
                  <div class="text-[13px] font-medium text-[#0F172A]">
                    {{ lead.name }}
                  </div>
                  <div class="text-[10px] text-[#94A3B8]">{{ lead.role }}</div>
                </td>
                <td class="py-3 px-2">
                  <div class="text-[13px] font-medium text-[#0F172A]">
                    {{ lead.company }}
                  </div>
                </td>
                <td class="py-3 px-2 text-center text-[12px] text-[#64748B]">
                  {{ lead.country }}
                </td>
                <td class="py-3 px-2 text-center text-[12px] text-[#64748B]">
                  {{ lead.source }}
                </td>
                <td class="py-3 px-2 text-center">
                  <span
                    class="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold"
                    :class="getTierClass(lead.tier)"
                    >{{ lead.tier }}</span
                  >
                </td>
                <td class="py-3 px-2 text-center">
                  <span
                    class="text-[12px] font-medium"
                    :class="getStatusClass(lead.status)"
                    >{{ lead.status }}</span
                  >
                </td>
                <td
                  class="py-3 px-2 text-center text-[12px] text-[#0F172A] font-medium"
                >
                  {{ lead.value }}
                </td>
                <td class="py-3 px-4 text-right text-[12px] text-[#94A3B8]">
                  {{ lead.updated }}
                </td>
                <td class="py-3 px-2 text-center relative">
                  <button
                    @click.stop="
                      activeDropdownId =
                        activeDropdownId === lead.id ? null : lead.id
                    "
                    class="p-1 rounded text-gray-400 hover:text-gray-800 hover:bg-gray-200 transition"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>
                  <div
                    v-if="activeDropdownId === lead.id"
                    class="absolute right-8 top-10 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-30 py-1 text-left overflow-hidden"
                  >
                    <button
                      @click.stop="openEditModal(lead)"
                      class="w-full px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 text-left transition"
                    >
                      Edit
                    </button>
                    <button
                      @click.stop="deleteLead(lead.id)"
                      class="w-full px-4 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 text-left transition"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- TAMPILAN SMARTPHONE (MOBILE CARD VIEW) -->
        <div v-if="isLoading" class="block md:hidden divide-y divide-gray-100">
          <div
            v-for="i in 5"
            :key="'skel-mob-' + i"
            class="p-4 flex flex-col gap-3"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-3">
                <div class="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div>
                  <div
                    class="h-4 bg-gray-300 rounded w-32 mb-1.5 animate-pulse"
                  ></div>
                  <div class="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div class="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                <div class="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div
              class="flex items-center justify-between bg-[#F8FAFC] p-2.5 rounded-lg border border-[#F1F5F9]"
            >
              <div class="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div class="h-3 bg-gray-300 rounded w-12 animate-pulse"></div>
              <div class="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
            <div class="flex items-center justify-between px-0.5">
              <div class="h-2 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div class="h-2 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div
          v-else
          class="block md:hidden divide-y divide-gray-100 animate-fade-in"
          :key="'mob-' + activeTab + currentPage"
        >
          <div
            v-for="lead in paginatedLeads"
            :key="'m-' + lead.id"
            @click="handleRowClick(lead)"
            class="p-4 flex flex-col gap-3 transition active:bg-gray-50"
            :class="
              selectedLeads.includes(lead.id) ? 'bg-[#EFF6FF]' : 'bg-white'
            "
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  :value="lead.id"
                  v-model="selectedLeads"
                  @click.stop
                  class="rounded border-gray-300 text-[#2563EB] w-4 h-4"
                />
                <div>
                  <h3
                    class="text-[14px] font-bold text-[#0F172A] leading-tight"
                  >
                    {{ lead.name }}
                  </h3>
                  <p class="text-[12px] text-[#64748B] font-medium">
                    {{ lead.company }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold"
                  :class="getTierClass(lead.tier)"
                  >{{ lead.tier }}</span
                ><button
                  @click.stop="openEditModal(lead)"
                  class="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div
              class="flex items-center justify-between text-[12px] bg-[#F8FAFC] p-2.5 rounded-lg border border-[#F1F5F9]"
            >
              <div class="flex items-center gap-1.5">
                <span class="text-gray-400 text-[11px]">Status:</span
                ><span class="font-bold" :class="getStatusClass(lead.status)">{{
                  lead.status
                }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="text-gray-400 text-[11px]">Value:</span
                ><span class="font-bold text-[#0F172A]">{{ lead.value }}</span>
              </div>
              <div class="text-[#64748B] font-medium text-[11px]">
                📍 {{ lead.country }}
              </div>
            </div>
            <div
              class="flex items-center justify-between text-[11px] text-[#94A3B8] px-0.5"
            >
              <span>{{ lead.role }} • {{ lead.source }}</span
              ><span>{{ lead.updated }}</span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="filteredLeads.length === 0 && !isLoading"
          class="py-12 sm:py-16 text-center animate-fade-in"
        >
          <svg
            class="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p class="text-[13px] sm:text-[14px] text-gray-500 font-medium">
            No leads found in this category.
          </p>
        </div>

        <!-- Footer Pagination Responsif -->
        <div
          class="p-3 sm:p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E2E8F0]"
        >
          <div
            class="text-[12px] sm:text-[14px] text-black font-medium order-2 sm:order-1"
          >
            {{ isLoading ? "Loading data..." : paginationText }}
          </div>
          <div
            class="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end order-1 sm:order-2"
          >
            <button
              @click="prevPage"
              :disabled="currentPage === 1 || isLoading"
              class="flex-1 sm:flex-none px-4 sm:px-5 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-[12px] sm:text-[13px] font-bold text-black hover:bg-gray-50 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              @click="nextPage"
              :disabled="
                currentPage === totalPages || totalPages === 0 || isLoading
              "
              class="flex-1 sm:flex-none px-5 sm:px-7 py-1.5 sm:py-2 bg-[#2563EB] text-white rounded-lg text-[12px] sm:text-[13px] font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div class="text-center text-[11px] text-[#2563EB] pt-6 sm:pt-8 pb-4">
        © 2026 DDTech. All rights reserved.
      </div>
    </main>
  </MainLayout>

  <!-- MODAL (CREATE & UPDATE LEAD) -->
  <div
    v-if="isModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
  >
    <div
      class="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm transition-opacity"
      @click="closeModal"
    ></div>
    <div
      class="relative bg-white rounded-xl shadow-2xl w-full max-w-[480px] p-6 sm:p-8 overflow-y-auto max-h-[90vh] animate-fade-in"
    >
      <div class="mb-5 sm:mb-6">
        <h2
          class="text-[22px] sm:text-[26px] font-bold text-black tracking-tight leading-none mb-1"
        >
          {{ editingId ? "Edit lead" : "Add new lead" }}
        </h2>
      </div>
      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label
            class="block text-[13px] sm:text-[15px] font-bold text-black mb-1.5"
            >Full Name</label
          ><input
            v-model="newLead.name"
            type="text"
            required
            class="w-full border border-gray-300 rounded-lg px-3.5 py-2 sm:py-2.5 text-[13px] sm:text-[14px] focus:ring-1 focus:ring-[#2563EB] focus:outline-none"
          />
        </div>
        <div>
          <label
            class="block text-[13px] sm:text-[15px] font-bold text-black mb-1.5"
            >Company</label
          ><input
            v-model="newLead.company"
            type="text"
            required
            class="w-full border border-gray-300 rounded-lg px-3.5 py-2 sm:py-2.5 text-[13px] sm:text-[14px] focus:ring-1 focus:ring-[#2563EB] focus:outline-none"
          />
        </div>

        <div class="flex gap-3 sm:gap-4">
          <div class="w-1/2">
            <label
              class="block text-[13px] sm:text-[15px] font-bold text-black mb-1.5"
              >Tier</label
            >
            <select
              v-model="newLead.tier"
              class="w-full border border-gray-300 rounded-lg px-3.5 py-2 sm:py-2.5 text-[13px] sm:text-[14px] focus:ring-1 focus:ring-[#2563EB] focus:outline-none bg-white"
            >
              <option>Tier A</option>
              <option>Tier B</option>
              <option>Tier C</option>
            </select>
          </div>
          <div class="w-1/2">
            <label
              class="block text-[13px] sm:text-[15px] font-bold text-black mb-1.5"
              >Status</label
            >
            <select
              v-model="newLead.status"
              class="w-full border border-gray-300 rounded-lg px-3.5 py-2 sm:py-2.5 text-[13px] sm:text-[14px] focus:ring-1 focus:ring-[#2563EB] focus:outline-none bg-white"
            >
              <option>New Lead</option>
              <option>Qualified</option>
              <option>Demo</option>
            </select>
          </div>
        </div>

        <div
          class="flex items-center justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-100"
        >
          <button
            type="button"
            @click="closeModal"
            class="px-4 sm:px-5 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-[13px] sm:text-[14px] font-bold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 sm:px-5 py-1.5 sm:py-2 bg-[#2563EB] text-white rounded-lg text-[13px] sm:text-[14px] font-bold hover:bg-blue-700 transition"
          >
            {{ editingId ? "Save changes" : "Add lead" }}
          </button>
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
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e2e8f0;
  border-radius: 4px;
}
</style>
