<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import MainLayout from "../components/MainLayout.vue";
import api from "../services/api";
import { useToast } from "../composables/UseToast";

const { showToast } = useToast();
const isLoading = ref(true);

interface Lead {
  id: string;
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
      leadsData.value = response.data.data.map((lead: any) => ({
        id: lead.id,
        name: lead.full_name || lead.email || 'Unknown',
        role: lead.role || '-',
        company: lead.company_name || '-',
        country: lead.country || '-',
        source: lead.source_page || '-',
        tier: lead.lead_tier || '-',
        status: lead.status || 'New Lead',
        value: lead.lead_score ? `${lead.lead_score}` : '-',
        updated: new Date(lead.updated_at || lead.created_at).toLocaleDateString(),
        isValid: lead.fit_status !== 'Invalid'
      }));
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

// ===================================        </div>
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
