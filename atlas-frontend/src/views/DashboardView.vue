<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import MainLayout from '../components/MainLayout.vue' // Impor Layout Utama

// State untuk animasi dan interaksi
const showBars = ref(false)
const maskProgress = ref(0) 
const hoveredSource = ref<any>(null)
const tooltipX = ref(0)
const tooltipY = ref(0)

const rawLeads = ref<any[]>([])

const fetchDashboardData = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/leads`);
    rawLeads.value = response.data.data;
    
    // Beri sedikit delay agar animasi terlihat jelas saat halaman selesai dimuat
    setTimeout(() => {
      showBars.value = true
      animateNumbers() 
    }, 150)
  } catch (error) {
    console.error("Gagal mengambil data:", error);
  }
};

onMounted(() => {
  fetchDashboardData();
})

// Fungsi animasi pergerakan angka (0 ke target) & animasi sapuan Donut Chart
const animateNumbers = () => {
  const duration = 1500; 
  let startTimestamp: number | null = null;

  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    
    const easeOut = 1 - Math.pow(1 - progress, 3); 

    // Animasi sapuan melingkar Donut Chart (0 ke 100)
    maskProgress.value = easeOut * 100;

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      maskProgress.value = 100;
    }
  };
  
  window.requestAnimationFrame(step);
}

// Fungsi untuk memperbarui posisi Tooltip mengikuti kursor
const updateTooltip = (event: MouseEvent) => {
  tooltipX.value = event.clientX;
  tooltipY.value = event.clientY;
}

// ==========================================
// DATA DINAMIS DARI DATABASE
// ==========================================

const kpiCards = computed(() => {
  const total = rawLeads.value.length;
  const tierA = rawLeads.value.filter(lead => lead.lead_tier === 'Tier A').length;
  const newLeads = rawLeads.value.filter(lead => lead.status === 'New Lead').length;
  const demoReq = rawLeads.value.filter(lead => lead.status === 'Demo' || lead.status === 'Demo Booked').length;
  const conversionRate = total > 0 ? ((rawLeads.value.filter(lead => lead.status === 'Won').length / total) * 100).toFixed(1) : '0';

  return [
    { label: 'Tier A leads', value: tierA.toLocaleString(), trendValue: '+ 0%', trendText: 'Live Data', isPositive: true },
    { label: 'Total Leads', value: total.toLocaleString(), trendValue: '+ 0%', trendText: 'Live Data', isPositive: true },
    { label: 'New Leads', value: newLeads.toLocaleString(), trendValue: '+ 0%', trendText: 'Live Data', isPositive: true },
    { label: 'Demo Request', value: demoReq.toLocaleString(), trendValue: '+ 0%', trendText: 'Live Data', isPositive: false },
    { label: 'Conversion Rate', value: `${conversionRate}%`, trendValue: '+ 0pp', trendText: 'Live Data', isPositive: true }
  ]
})

const countryData = computed(() => {
  const counts: Record<string, number> = { 'Australia': 0, 'New Zealand': 0, 'Indonesia': 0 };
  
  rawLeads.value.forEach(lead => {
    const country = lead.country;
    if (counts[country] !== undefined) {
      counts[country]!++;
    }
  });

  const maxCount = Math.max(counts['Australia'] || 0, counts['New Zealand'] || 0, counts['Indonesia'] || 0, 1);

  return [
    { name: 'Australia', count: counts['Australia'] || 0, height: `h-[${Math.round(((counts['Australia'] || 0) / maxCount) * 280)}px]` },
    { name: 'New Zealand', count: counts['New Zealand'] || 0, height: `h-[${Math.round(((counts['New Zealand'] || 0) / maxCount) * 280)}px]` },
    { name: 'Indonesia', count: counts['Indonesia'] || 0, height: `h-[${Math.round(((counts['Indonesia'] || 0) / maxCount) * 280)}px]` }
  ];
})

const pipelineSteps = computed(() => {
  const total = rawLeads.value.length || 1; 
  
  const stepCounts = {
    'New Lead': 0,
    'Qualified': 0,
    'Contacted': 0,
    'Demo Booked': 0,
    'Proposal': 0,
    'Won / Lost': 0
  }

  rawLeads.value.forEach(lead => {
    const status = lead.status;
    if (status === 'New Lead') stepCounts['New Lead']++;
    else if (status === 'Qualified') stepCounts['Qualified']++;
    else if (status === 'Contacted') stepCounts['Contacted']++;
    else if (status === 'Demo' || status === 'Demo Booked') stepCounts['Demo Booked']++;
    else if (status === 'Proposal') stepCounts['Proposal']++;
    else if (status === 'Won' || status === 'Lost') stepCounts['Won / Lost']++;
  });

  return [
    { step: '1', title: 'New Lead', targetCount: stepCounts['New Lead'], displayCount: stepCounts['New Lead'].toString(), percentage: `${Math.round((stepCounts['New Lead']/total)*100)}% of total`, progress: `w-[${Math.round((stepCounts['New Lead']/total)*100)}%]` },
    { step: '2', title: 'Qualified', targetCount: stepCounts['Qualified'], displayCount: stepCounts['Qualified'].toString(), percentage: `${Math.round((stepCounts['Qualified']/total)*100)}% of total`, progress: `w-[${Math.round((stepCounts['Qualified']/total)*100)}%]` },
    { step: '3', title: 'Contacted', targetCount: stepCounts['Contacted'], displayCount: stepCounts['Contacted'].toString(), percentage: `${Math.round((stepCounts['Contacted']/total)*100)}% of total`, progress: `w-[${Math.round((stepCounts['Contacted']/total)*100)}%]` },
    { step: '4', title: 'Demo Booked', targetCount: stepCounts['Demo Booked'], displayCount: stepCounts['Demo Booked'].toString(), percentage: `${Math.round((stepCounts['Demo Booked']/total)*100)}% of total`, progress: `w-[${Math.round((stepCounts['Demo Booked']/total)*100)}%]` },
    { step: '5', title: 'Proposal', targetCount: stepCounts['Proposal'], displayCount: stepCounts['Proposal'].toString(), percentage: `${Math.round((stepCounts['Proposal']/total)*100)}% of total`, progress: `w-[${Math.round((stepCounts['Proposal']/total)*100)}%]` },
    { step: '6', title: 'Won / Lost', targetCount: stepCounts['Won / Lost'], displayCount: stepCounts['Won / Lost'].toString(), percentage: `${Math.round((stepCounts['Won / Lost']/total)*100)}% of total`, progress: `w-[${Math.round((stepCounts['Won / Lost']/total)*100)}%]` }
  ]
})

const sourceData = computed(() => {
  const total = rawLeads.value.length || 1;
  const sources: Record<string, number> = { 'Website': 0, 'Outbond AI': 0, 'Referral': 0, 'Events': 0, 'Partners': 0 };
  
  rawLeads.value.forEach(lead => {
    let source = lead.source_page;
    if (source === 'Outbound') source = 'Outbond AI';
    else if (source === 'Partner') source = 'Partners';
    else if (source === 'Event') source = 'Events';
    else if (source === 'LinkedIn') source = 'Referral'; // mapping linkedin to referral to match categories
    
    if (sources[source] !== undefined) {
      sources[source]!++;
    } else {
      sources['Website']!++;
    }
  });

  const colors = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];
  let currentOffset = 0;

  return Object.keys(sources).map((key, index) => {
    const count = sources[key] || 0;
    const percentNum = Math.round((count / total) * 100);
    const dasharray = `${percentNum} ${100 - percentNum}`;
    const dashoffset = -currentOffset;
    
    currentOffset += percentNum;
    
    return {
      label: key,
      count: count.toLocaleString(),
      percent: `${percentNum}%`,
      color: colors[index],
      dasharray: dasharray,
      dashoffset: dashoffset.toString()
    }
  });
})
</script>

<template>
  <!-- BUNGKUS DENGAN MAINLAYOUT -->
  <!-- Set active-menu="dashboard" agar Sidebar tahu mana yang harus disorot biru -->
  <MainLayout active-menu="dashboard">
    
    <!-- DASHBOARD BODY (Otomatis masuk ke dalam slot MainLayout) -->
    <main class="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 overflow-y-auto overflow-x-hidden">
      
      <div>
        <h1 class="text-[32px] font-bold text-[#0F172A]">Overview</h1>
        <p class="text-[16px] text-[#64748B] mt-0.5">Your AI Workforce performance for the last 7 days</p>
      </div>

      <!-- KPI Cards Grid -->
      <div class="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div 
          v-for="(card, index) in kpiCards" 
          :key="index" 
          class="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col justify-between"
        >
          <span class="text-[12px] font-semibold text-[#64748B]">{{ card.label }}</span>
          <div class="my-2">
            <span class="text-2xl font-bold text-[#0F172A]">{{ card.value }}</span>
          </div>
          
          <div class="flex items-center gap-1 mt-1">
            <svg v-if="!card.isPositive" class="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M19 12l-7 7-7-7"/>
            </svg>
            <svg v-else class="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
            <span class="text-[12px] font-bold" :class="card.isPositive ? 'text-green-500' : 'text-red-500'">
              {{ card.trendValue }}
            </span>
            <span class="text-[12px] text-[#94A3B8] font-medium ml-1">
              {{ card.trendText }}
            </span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Leads by Country (Bar Chart) -->
      <div class="bg-white p-4 md:p-6 rounded-2xl border border-[#E2E8F0] shadow-sm overflow-x-auto">
        <div class="mb-2">
          <h2 class="text-[20px] font-bold text-[#0F172A]">Leads by Country</h2>
          <p class="text-[12px] text-[#64748B]">Distribution across active markets</p>
        </div>

        <div class="flex mt-4 h-[280px] min-w-[400px]">
          <div class="flex flex-col justify-between text-[11px] text-[#94A3B8] font-medium pr-4 text-right mb-6">
            <span>6000</span>
            <span>4500</span>
            <span>3000</span>
            <span>1500</span>
            <span>0</span>
          </div>

          <div class="flex-1 border-b border-[#E2E8F0] flex items-end justify-around pb-0 mb-6 relative">
            <div v-for="item in countryData" :key="item.name" class="flex flex-col items-center w-20 relative">
              <div 
                class="w-16 bg-[#2563EB] rounded-t-xl transition-all duration-1000 ease-out origin-bottom" 
                :class="showBars ? item.height : 'h-0'"
              ></div>
              <span class="absolute -bottom-6 text-xs text-[#64748B] font-medium whitespace-nowrap">
                {{ item.name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Leads by Source (Donut Chart) -->
      <div class="bg-white p-4 md:p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
        <div class="mb-6">
          <h2 class="text-[20px] font-bold text-[#0F172A]">Leads by Source</h2>
          <p class="text-[12px] text-[#64748B]">Where qualified leads originate</p>
        </div>

        <div class="flex flex-col md:flex-row items-center justify-around gap-8 py-4">
          <div class="relative w-48 h-48 flex items-center justify-center">
            <div class="absolute flex flex-col items-center justify-center pointer-events-none">
              <span class="text-3xl font-bold text-[#0F172A] tracking-tight">{{ rawLeads.length.toLocaleString() }}</span>
              <span class="text-sm text-[#64748B] font-semibold mt-1">Total</span>
            </div>
            
            <svg viewBox="0 0 44 44" class="w-full h-full -rotate-90">
              <defs>
                <mask id="circular-wipe">
                  <circle cx="22" cy="22" r="15.915" fill="transparent" stroke="white" stroke-width="10" 
                    :stroke-dasharray="`${maskProgress} 100`" stroke-dashoffset="0"></circle>
                </mask>
              </defs>

              <g mask="url(#circular-wipe)">
                <circle 
                  v-for="(item, index) in sourceData" 
                  :key="index"
                  cx="22" cy="22" r="15.915" fill="transparent" stroke-width="7" 
                  :stroke="item.color" 
                  :stroke-dasharray="item.dasharray" 
                  :stroke-dashoffset="item.dashoffset"
                  class="transition-opacity duration-300 cursor-pointer"
                  :class="hoveredSource && hoveredSource !== item ? 'opacity-80' : 'opacity-100'"
                  @mouseenter="hoveredSource = item" 
                  @mouseleave="hoveredSource = null"
                  @mousemove="updateTooltip"
                ></circle>
              </g>
            </svg>
          </div>

          <div 
            v-if="hoveredSource" 
            class="fixed z-50 bg-white px-4 py-2.5 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-100 pointer-events-none transition-opacity duration-200"
            :style="{ top: `${tooltipY + 15}px`, left: `${tooltipX + 15}px` }"
          >
            <span class="text-[13px] text-gray-800 font-medium">
              {{ hoveredSource.label }} : {{ hoveredSource.count }}
            </span>
          </div>

          <div class="space-y-3 w-full max-w-xs relative z-0">
            <div 
              v-for="source in sourceData" :key="source.label" 
              class="flex items-center justify-between text-xs p-1.5 rounded transition-colors cursor-pointer"
              :class="hoveredSource === source ? 'bg-[#EFF6FF]' : ''"
              @mouseenter="hoveredSource = source" 
              @mouseleave="hoveredSource = null"
              @mousemove="updateTooltip"
            >
              <div class="flex items-center gap-2 pointer-events-none">
                <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: source.color }"></span>
                <span class="font-medium" :class="hoveredSource === source ? 'text-[#2563EB]' : 'text-[#475569]'">
                  {{ source.label }}
                </span>
              </div>
              <span class="font-bold text-[#0F172A] pointer-events-none">{{ source.percent }}</span>
            </div>
          </div>
        </div>
      </div>
      </div>

      <!-- Pipeline Status Summary -->
      <div class="bg-white p-4 md:p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
        <div class="mb-6">
          <h2 class="text-[20px] font-bold text-[#0F172A]">Pipeline Status Summary</h2>
          <p class="text-[12px] text-[#64748B]">Lead volume at each stage of the Atlas workflow</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div 
            v-for="step in pipelineSteps" 
            :key="step.step" 
            class="p-4 rounded-xl border border-[#E2E8F0] bg-[#FAFAFA] flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center gap-1.5 text-xs text-[#64748B] mb-2 font-medium">
                <span class="w-4 h-4 rounded bg-[#E0E7FF] text-[#2563EB] flex items-center justify-center text-[10px] font-bold">{{ step.step }}</span>
                <span>{{ step.title }}</span>
              </div>
              <div class="text-xl font-bold text-[#0F172A] mb-3">{{ step.displayCount }}</div>
            </div>

            <div>
              <div class="w-full bg-[#E2E8F0] h-1 rounded-full overflow-hidden mb-1.5">
                <div class="bg-[#2563EB] h-full rounded-full" :class="step.progress"></div>
              </div>
              <span class="text-[10px] text-[#94A3B8]">{{ step.percentage }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center text-[11px] text-[#94A3B8] pt-4 pb-6">
        © 2026 DDTech. All rights reserved.
      </div>

    </main>
  </MainLayout>
</template>