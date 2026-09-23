<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import MainLayout from '../components/MainLayout.vue'
import api from '../services/api'

// State untuk animasi dan interaksi
const showBars = ref(false)
const maskProgress = ref(0) 
const hoveredSource = ref<any>(null)

// State untuk posisi Tooltip
const tooltipX = ref(0)
const tooltipY = ref(0)

let refreshInterval: number | undefined;

onMounted(() => {
  fetchDashboardData().then(() => {
    setTimeout(() => {
      showBars.value = true
      animateNumbers() 
    }, 150)
  })

  // Auto refresh data every 10 seconds
  refreshInterval = window.setInterval(() => {
    fetchDashboardData()
  }, 10000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

const animateNumbers = () => {
  const duration = 1500; 
  let startTimestamp: number | null = null;

  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3); 

    pipelineSteps.value.forEach(item => {
      item.displayCount = Math.floor(easeOut * item.targetCount).toLocaleString('en-US');
    });

    maskProgress.value = easeOut * 100;

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      pipelineSteps.value.forEach(item => {
        item.displayCount = item.targetCount.toLocaleString('en-US');
      });
      maskProgress.value = 100;
    }
  };
  
  window.requestAnimationFrame(step);
}

const updateTooltip = (event: MouseEvent) => {
  tooltipX.value = event.clientX;
  tooltipY.value = event.clientY;
}


// Data state holding backend response
const dashboardData = ref<any>({
  total_leads: 0,
  new_leads_this_week: 0,
  tier_a_leads: 0,
  demo_requests: 0,
  conversion_rate: 0,
  leads_by_country: { Australia: 0, 'New Zealand': 0, Indonesia: 0 },
  leads_by_source: { Website: 0, 'Outbound AI': 0, Referral: 0, Events: 0, Partners: 0 },
  pipeline_summary: {
    'New Lead': 0,
    Qualified: 0,
    Contacted: 0,
    'Meeting Requested': 0,
    'Demo Scheduled': 0,
    'Proposal Sent': 0,
    Negotiation: 0,
    Won: 0,
    Lost: 0,
    Disqualified: 0
  }
})

const fetchDashboardData = async () => {
  try {
    const response = await api.get('/api/admin/dashboard');
    if (response.data) {
      // Merge backend data with default structure to prevent missing field errors
      const resData = response.data.data || response.data;
      dashboardData.value = {
        total_leads: resData.total_leads || 0,
        new_leads_this_week: resData.new_leads_this_week || 0,
        tier_a_leads: resData.tier_a_leads || 0,
        demo_requests: resData.demo_requests || 0,
        conversion_rate: resData.conversion_rate || 0,
        leads_by_country: resData.leads_by_country || { Australia: 0, 'New Zealand': 0, Indonesia: 0 },
        leads_by_source: resData.leads_by_source || { Website: 0, 'Outbound AI': 0, Referral: 0, Events: 0, Partners: 0 },
        pipeline_summary: resData.pipeline_summary || {
          'New Lead': 0,
          Qualified: 0,
          Contacted: 0,
          'Meeting Requested': 0,
          'Demo Scheduled': 0,
          'Proposal Sent': 0,
          Negotiation: 0,
          Won: 0,
          Lost: 0,
          Disqualified: 0
        }
      };
      updatePipelineSteps();
    }
  } catch (error) {
    console.warn("Failed to fetch dashboard data.", error);
  }
}

const kpiCards = computed(() => {
  const data = dashboardData.value;
  return [
    { label: 'Tier A leads', value: data.tier_a_leads.toLocaleString(), trendValue: '+ 0%', trendText: 'Live Data', isPositive: true },
    { label: 'Total Leads', value: data.total_leads.toLocaleString(), trendValue: '+ 0%', trendText: 'Live Data', isPositive: true },
    { label: 'New Leads', value: data.new_leads_this_week.toLocaleString(), trendValue: '+ 0%', trendText: 'Live Data', isPositive: true },
    { label: 'Demo Request', value: data.demo_requests.toLocaleString(), trendValue: '+ 0%', trendText: 'Live Data', isPositive: false },
    { label: 'Conversion Rate', value: `${data.conversion_rate}%`, trendValue: '+ 0pp', trendText: 'Live Data', isPositive: true }
  ]
})

const maxChartValue = computed(() => {
  const counts = dashboardData.value.leads_by_country || {};
  let australia = 0;
  let newZealand = 0;
  let indonesia = 0;
  let otherCount = 0;

  for (const key in counts) {
    const lowerKey = key.toLowerCase();
    if (lowerKey === 'australia') australia += counts[key];
    else if (lowerKey === 'new zealand' || lowerKey === 'newzealand') newZealand += counts[key];
    else if (lowerKey === 'indonesia') indonesia += counts[key];
    else otherCount += counts[key];
  }

  const max = Math.max(australia, newZealand, indonesia, otherCount, 1);
  
  if (max <= 4) return 4;
  if (max <= 10) return 10;
  if (max <= 40) return 40;
  if (max <= 100) return 100;
  
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  const normalized = max / magnitude; 
  
  let niceMax;
  if (normalized <= 1) niceMax = 1;
  else if (normalized <= 2) niceMax = 2;
  else if (normalized <= 4) niceMax = 4;
  else if (normalized <= 5) niceMax = 5;
  else niceMax = 10;
  
  return niceMax * magnitude;
});

const yAxisLabels = computed(() => {
  const max = maxChartValue.value;
  const formatFn = (val: number) => val >= 1000 ? (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1).replace('.0', '') + 'k' : Math.round(val).toString();
  
  return [
    formatFn(max),
    formatFn(max * 0.75),
    formatFn(max * 0.5),
    formatFn(max * 0.25),
    '0'
  ];
});

const countryData = computed(() => {
  const counts = dashboardData.value.leads_by_country || {};
  let australia = 0;
  let newZealand = 0;
  let indonesia = 0;
  let otherCount = 0;

  for (const key in counts) {
    const lowerKey = key.toLowerCase();
    if (lowerKey === 'australia') australia += counts[key];
    else if (lowerKey === 'new zealand' || lowerKey === 'newzealand') newZealand += counts[key];
    else if (lowerKey === 'indonesia') indonesia += counts[key];
    else otherCount += counts[key];
  }
  
  const maxVal = maxChartValue.value;

  return [
    { name: 'Australia', count: australia, height: Math.round((australia / maxVal) * 190) },
    { name: 'New Zealand', count: newZealand, height: Math.round((newZealand / maxVal) * 190) },
    { name: 'Indonesia', count: indonesia, height: Math.round((indonesia / maxVal) * 190) },
    { name: 'Other', count: otherCount, height: Math.round((otherCount / maxVal) * 190) }
  ];
})

const pipelineSteps = ref<any[]>([
  { step: '1', title: 'New Lead', targetCount: 0, displayCount: '0', percentage: '0% of total', progress: 0 },
  { step: '2', title: 'Qualified', targetCount: 0, displayCount: '0', percentage: '0% of total', progress: 0 },
  { step: '3', title: 'Contacted', targetCount: 0, displayCount: '0', percentage: '0% of total', progress: 0 },
  { step: '4', title: 'Meeting Requested', targetCount: 0, displayCount: '0', percentage: '0% of total', progress: 0 },
  { step: '5', title: 'Demo Scheduled', targetCount: 0, displayCount: '0', percentage: '0% of total', progress: 0 },
  { step: '6', title: 'Proposal Sent', targetCount: 0, displayCount: '0', percentage: '0% of total', progress: 0 },
  { step: '7', title: 'Negotiation', targetCount: 0, displayCount: '0', percentage: '0% of total', progress: 0 },
  { step: '8', title: 'Won', targetCount: 0, displayCount: '0', percentage: '0% of total', progress: 0 },
  { step: '9', title: 'Lost', targetCount: 0, displayCount: '0', percentage: '0% of total', progress: 0 },
  { step: '10', title: 'Disqualified', targetCount: 0, displayCount: '0', percentage: '0% of total', progress: 0 }
])

const updatePipelineSteps = () => {
  const total = dashboardData.value.total_leads || 1; 
  const stepCounts = dashboardData.value.pipeline_summary || {
    'New Lead': 0, 'Qualified': 0, 'Contacted': 0, 'Meeting Requested': 0, 'Demo Scheduled': 0, 'Proposal Sent': 0, 'Negotiation': 0, 'Won': 0, 'Lost': 0, 'Disqualified': 0
  }

  const getDisplay = (val: number) => showBars.value ? val.toLocaleString('en-US') : '0';

  pipelineSteps.value = [
    { step: '1', title: 'New Lead', targetCount: stepCounts['New Lead'] || 0, displayCount: getDisplay(stepCounts['New Lead'] || 0), percentage: `${Math.round(((stepCounts['New Lead'] || 0)/total)*100)}% of total`, progress: Math.round(((stepCounts['New Lead'] || 0)/total)*100) },
    { step: '2', title: 'Qualified', targetCount: stepCounts['Qualified'] || 0, displayCount: getDisplay(stepCounts['Qualified'] || 0), percentage: `${Math.round(((stepCounts['Qualified'] || 0)/total)*100)}% of total`, progress: Math.round(((stepCounts['Qualified'] || 0)/total)*100) },
    { step: '3', title: 'Contacted', targetCount: stepCounts['Contacted'] || 0, displayCount: getDisplay(stepCounts['Contacted'] || 0), percentage: `${Math.round(((stepCounts['Contacted'] || 0)/total)*100)}% of total`, progress: Math.round(((stepCounts['Contacted'] || 0)/total)*100) },
    { step: '4', title: 'Meeting Requested', targetCount: stepCounts['Meeting Requested'] || 0, displayCount: getDisplay(stepCounts['Meeting Requested'] || 0), percentage: `${Math.round(((stepCounts['Meeting Requested'] || 0)/total)*100)}% of total`, progress: Math.round(((stepCounts['Meeting Requested'] || 0)/total)*100) },
    { step: '5', title: 'Demo Scheduled', targetCount: stepCounts['Demo Scheduled'] || 0, displayCount: getDisplay(stepCounts['Demo Scheduled'] || 0), percentage: `${Math.round(((stepCounts['Demo Scheduled'] || 0)/total)*100)}% of total`, progress: Math.round(((stepCounts['Demo Scheduled'] || 0)/total)*100) },
    { step: '6', title: 'Proposal Sent', targetCount: stepCounts['Proposal Sent'] || 0, displayCount: getDisplay(stepCounts['Proposal Sent'] || 0), percentage: `${Math.round(((stepCounts['Proposal Sent'] || 0)/total)*100)}% of total`, progress: Math.round(((stepCounts['Proposal Sent'] || 0)/total)*100) },
    { step: '7', title: 'Negotiation', targetCount: stepCounts['Negotiation'] || 0, displayCount: getDisplay(stepCounts['Negotiation'] || 0), percentage: `${Math.round(((stepCounts['Negotiation'] || 0)/total)*100)}% of total`, progress: Math.round(((stepCounts['Negotiation'] || 0)/total)*100) },
    { step: '8', title: 'Won', targetCount: stepCounts['Won'] || 0, displayCount: getDisplay(stepCounts['Won'] || 0), percentage: `${Math.round(((stepCounts['Won'] || 0)/total)*100)}% of total`, progress: Math.round(((stepCounts['Won'] || 0)/total)*100) },
    { step: '9', title: 'Lost', targetCount: stepCounts['Lost'] || 0, displayCount: getDisplay(stepCounts['Lost'] || 0), percentage: `${Math.round(((stepCounts['Lost'] || 0)/total)*100)}% of total`, progress: Math.round(((stepCounts['Lost'] || 0)/total)*100) },
    { step: '10', title: 'Disqualified', targetCount: stepCounts['Disqualified'] || 0, displayCount: getDisplay(stepCounts['Disqualified'] || 0), percentage: `${Math.round(((stepCounts['Disqualified'] || 0)/total)*100)}% of total`, progress: Math.round(((stepCounts['Disqualified'] || 0)/total)*100) }
  ]
}

const sourceData = computed(() => {
  const total = dashboardData.value.total_leads || 1;
  const sources = dashboardData.value.leads_by_source || { 'Website': 0, 'Outbound AI': 0, 'Referral': 0, 'Events': 0, 'Partners': 0 };

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
  <MainLayout active-menu="dashboard">
    <main class="flex-1 p-8 space-y-8 overflow-y-auto bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300">
      <div class="animate-fade-in">
        <h1 class="text-[32px] font-bold text-[#0F172A] dark:text-white">Overview</h1>
        <p class="text-[16px] text-[#64748B] dark:text-slate-400 mt-0.5">Your AI Workforce performance for the last 7 days</p>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 animate-fade-in">
        <div 
          v-for="(card, index) in kpiCards" 
          :key="index" 
          class="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-800/50 shadow-sm flex flex-col justify-between transition-colors duration-300"
        >
          <span class="text-[12px] font-semibold text-[#64748B] dark:text-slate-400">{{ card.label }}</span>
          <div class="my-2">
            <span class="text-2xl font-bold text-[#0F172A] dark:text-white">{{ card.value }}</span>
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

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
        
        <!--Leads by Country (Bar Chart)-->
        <div class="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-[#E2E8F0] dark:border-slate-800/50 shadow-sm flex flex-col transition-colors duration-300">
          <div class="mb-4">
            <h2 class="text-[18px] font-bold text-[#0F172A] dark:text-white">Leads by Country</h2>
            <p class="text-[12px] text-[#64748B] dark:text-slate-400">Distribution across active markets</p>
          </div>

          <div class="flex-1 flex mt-2 h-[220px]">
            <div class="flex flex-col justify-between text-[10px] text-[#94A3B8] dark:text-slate-500 font-medium pr-3 text-right">
              <span v-for="(label, i) in yAxisLabels" :key="i">{{ label }}</span>
            </div>

            <div class="flex-1 border-b border-[#E2E8F0] dark:border-slate-700/50 flex items-end justify-around pb-0 relative">
              <div v-for="item in countryData" :key="item.name" class="flex flex-col items-center w-full max-w-[60px] relative group">
                <div class="absolute -top-8 bg-[#0F172A] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {{ item.count.toLocaleString() }} Leads
                </div>
                
                <div 
                  class="w-full max-w-[32px] bg-[#2563EB] rounded-t-md transition-all duration-1000 ease-out origin-bottom hover:bg-blue-600" 
                  :style="{ height: showBars ? item.height + 'px' : '0px' }"
                ></div>
                <span class="absolute -bottom-6 text-[11px] text-[#64748B] font-medium whitespace-nowrap text-center">
                  {{ item.name }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!--Leads by Source (Donut Chart)-->
        <div class="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-[#E2E8F0] dark:border-slate-800/50 shadow-sm flex flex-col transition-colors duration-300">
          <div class="mb-4">
            <h2 class="text-[18px] font-bold text-[#0F172A] dark:text-white">Leads by Source</h2>
            <p class="text-[12px] text-[#64748B] dark:text-slate-400">Where qualified leads originate</p>
          </div>
          <div class="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 py-2">
            <!-- Donut Chart -->
            <div class="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
              <div class="absolute flex flex-col items-center justify-center pointer-events-none transition-all duration-200">
                <span class="text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight">
                  {{ hoveredSource ? hoveredSource.count : dashboardData.total_leads.toLocaleString() }}
                </span>
                <span class="text-[10px] text-[#64748B] dark:text-slate-400 font-semibold mt-0.5">
                  {{ hoveredSource ? hoveredSource.label : 'Total' }}
                </span>
              </div>
              <svg viewBox="0 0 42 42" class="w-full h-full -rotate-90">
                <defs>
                  <mask id="circular-wipe">
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="white" stroke-width="10" 
                      :stroke-dasharray="`${maskProgress} 100`" stroke-dashoffset="0"></circle>
                  </mask>
                </defs>
                <g mask="url(#circular-wipe)">
                  <circle 
                    v-for="(item, index) in sourceData" 
                    :key="index"
                    cx="21" cy="21" r="15.915" fill="transparent" stroke-width="7" 
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
            <!-- Legend -->
            <div class="space-y-2.5 w-full max-w-[180px]">
              <div 
                v-for="source in sourceData" :key="source.label" 
                class="flex items-center justify-between text-[11px] p-1.5 rounded transition-colors cursor-pointer"
                :class="hoveredSource === source ? 'bg-[#EFF6FF] dark:bg-slate-800' : ''"
                @mouseenter="hoveredSource = source" 
                @mouseleave="hoveredSource = null"
                @mousemove="updateTooltip"
              >
                <div class="flex items-center gap-2 pointer-events-none">
                  <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: source.color }"></span>
                  <span class="font-medium truncate" :class="hoveredSource === source ? 'text-[#2563EB] dark:text-blue-400' : 'text-[#475569] dark:text-slate-400'">
                    {{ source.label }}
                  </span>
                </div>
                <span class="font-bold text-[#0F172A] dark:text-white pointer-events-none flex-shrink-0">{{ source.percent }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--Pipeline Status Summary-->
      <div class="bg-white dark:bg-[#0F172A] p-6 rounded-2xl border border-[#E2E8F0] dark:border-slate-800/50 shadow-sm animate-fade-in transition-colors duration-300">
        <div class="mb-6">
          <h2 class="text-[20px] font-bold text-[#0F172A] dark:text-white">Pipeline Status Summary</h2>
          <p class="text-[12px] text-[#64748B] dark:text-slate-400">Lead volume at each stage of the Atlas workflow</p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          <div 
            v-for="step in pipelineSteps" 
            :key="step.step" 
            class="p-4 rounded-xl border border-[#E2E8F0] dark:border-slate-700/50 bg-[#FAFAFA] dark:bg-slate-800/30 flex flex-col justify-between transition-colors duration-300"
          >
            <div>
              <div class="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-slate-400 mb-2 font-medium">
                <span class="w-4 h-4 rounded bg-[#E0E7FF] dark:bg-blue-900/30 text-[#2563EB] dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">{{ step.step }}</span>
                <span>{{ step.title }}</span>
              </div>
              <div class="text-xl font-bold text-[#0F172A] dark:text-white mb-3">{{ step.displayCount }}</div>
            </div>
            <div>
              <div class="w-full bg-[#E2E8F0] h-1 rounded-full overflow-hidden mb-1.5">
                <div class="bg-[#2563EB] h-full rounded-full transition-all duration-1000 ease-out" :style="{ width: step.progress + '%' }"></div>
              </div>
              <span class="text-[10px] text-[#94A3B8]">{{ step.percentage }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="text-center text-[11px] text-[#94A3B8] pt-4 pb-6">
        © 2026 DDTech. All rights reserved.
      </div>

    </main>
  </MainLayout>
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
</style>