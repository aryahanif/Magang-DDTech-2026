<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MainLayout from '../components/MainLayout.vue'

// State untuk animasi dan interaksi
const showBars = ref(false)
const maskProgress = ref(0) 
const hoveredSource = ref<any>(null)

// State untuk posisi Tooltip
const tooltipX = ref(0)
const tooltipY = ref(0)

onMounted(() => {
  setTimeout(() => {
    showBars.value = true
    animateNumbers() 
  }, 150)
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

const kpiCards = [
  { label: 'Tier A leads', value: '12,207', trendValue: '+ 3.1%', trendText: 'vs last week', isPositive: true },
  { label: 'Total Leads', value: '12,482', trendValue: '+ 3.1%', trendText: 'vs last week', isPositive: true },
  { label: 'New Leads This Week', value: '634', trendValue: '+ 12.4%', trendText: 'vs last week', isPositive: true },
  { label: 'Demo Request', value: '289', trendValue: '- 2.4%', trendText: 'vs last week', isPositive: false },
  { label: 'Conversion Rate', value: '4.8%', trendValue: '+ 0.6pp', trendText: 'vs last week', isPositive: true }
]

const countryData = [
  { name: 'Australia', count: 5900, height: 'h-[190px]' },
  { name: 'New Zealand', count: 3000, height: 'h-[95px]' },
  { name: 'Indonesia', count: 3600, height: 'h-[115px]' }
]

const pipelineSteps = ref([
  { step: '1', title: 'New Lead', targetCount: 12482, displayCount: '0', percentage: '100% of total', progress: 'w-full' },
  { step: '2', title: 'Qualified', targetCount: 7310, displayCount: '0', percentage: '59% of total', progress: 'w-[59%]' },
  { step: '3', title: 'Contacted', targetCount: 4180, displayCount: '0', percentage: '33% of total', progress: 'w-[33%]' },
  { step: '4', title: 'Demo Booked', targetCount: 1620, displayCount: '0', percentage: '13% of total', progress: 'w-[13%]' },
  { step: '5', title: 'Proposal', targetCount: 740, displayCount: '0', percentage: '6% of total', progress: 'w-[6%]' },
  { step: '6', title: 'Won / Lost', targetCount: 598, displayCount: '0', percentage: '5% of total', progress: 'w-[5%]' }
])

const sourceData = [
  { label: 'Website', count: '4,210', percent: '34%', color: '#2563EB', dasharray: '33 67', dashoffset: '0' },
  { label: 'Outbond AI', count: '3,120', percent: '25%', color: '#3B82F6', dasharray: '24 76', dashoffset: '-34' },
  { label: 'Referral', count: '2,122', percent: '17%', color: '#60A5FA', dasharray: '16 84', dashoffset: '-59' },
  { label: 'Events', count: '1,498', percent: '12%', color: '#93C5FD', dasharray: '11 89', dashoffset: '-76' },
  { label: 'Partners', count: '1,532', percent: '11%', color: '#BFDBFE', dasharray: '10 90', dashoffset: '-88' }
]
</script>

<template>
  <MainLayout active-menu="dashboard">
    <main class="flex-1 p-8 space-y-8 overflow-y-auto">
      
      <div>
        <h1 class="text-[32px] font-bold text-[#0F172A]">Overview</h1>
        <p class="text-[16px] text-[#64748B] mt-0.5">Your AI Workforce performance for the last 7 days</p>
      </div>

      <!-- KPI Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

      <!-- Grid Container: Berdampingan di Desktop -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- 1. Leads by Country (Bar Chart) -->
        <div class="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col">
          <div class="mb-4">
            <h2 class="text-[18px] font-bold text-[#0F172A]">Leads by Country</h2>
            <p class="text-[12px] text-[#64748B]">Distribution across active markets</p>
          </div>

          <div class="flex-1 flex mt-2 h-[220px]">
            <div class="flex flex-col justify-between text-[10px] text-[#94A3B8] font-medium pr-3 text-right">
              <span>6k</span>
              <span>4.5k</span>
              <span>3k</span>
              <span>1.5k</span>
              <span>0</span>
            </div>

            <div class="flex-1 border-b border-[#E2E8F0] flex items-end justify-around pb-0 relative">
              <div v-for="item in countryData" :key="item.name" class="flex flex-col items-center w-full max-w-[60px] relative group">
                <div class="absolute -top-8 bg-[#0F172A] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {{ item.count.toLocaleString() }} Leads
                </div>
                
                <div 
                  class="w-full max-w-[32px] bg-[#2563EB] rounded-t-md transition-all duration-1000 ease-out origin-bottom hover:bg-blue-600" 
                  :class="showBars ? item.height : 'h-0'"
                ></div>
                <span class="absolute -bottom-6 text-[11px] text-[#64748B] font-medium whitespace-nowrap text-center">
                  {{ item.name }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Leads by Source (Donut Chart) -->
        <div class="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col">
          <div class="mb-4">
            <h2 class="text-[18px] font-bold text-[#0F172A]">Leads by Source</h2>
            <p class="text-[12px] text-[#64748B]">Where qualified leads originate</p>
          </div>

          <div class="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 py-2">
            
            <!-- Donut Chart -->
            <div class="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
              
              <!-- PERUBAHAN DI SINI: Teks Tengah yang Reaktif -->
              <div class="absolute flex flex-col items-center justify-center pointer-events-none transition-all duration-200">
                <span class="text-2xl font-bold text-[#0F172A] tracking-tight">
                  {{ hoveredSource ? hoveredSource.count : '12.4k' }}
                </span>
                <span class="text-[10px] text-[#64748B] font-semibold mt-0.5">
                  {{ hoveredSource ? hoveredSource.label : 'Total' }}
                </span>
              </div>
              <!-- END PERUBAHAN -->
              
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
                :class="hoveredSource === source ? 'bg-[#EFF6FF]' : ''"
                @mouseenter="hoveredSource = source" 
                @mouseleave="hoveredSource = null"
                @mousemove="updateTooltip"
              >
                <div class="flex items-center gap-2 pointer-events-none">
                  <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: source.color }"></span>
                  <span class="font-medium truncate" :class="hoveredSource === source ? 'text-[#2563EB]' : 'text-[#475569]'">
                    {{ source.label }}
                  </span>
                </div>
                <span class="font-bold text-[#0F172A] pointer-events-none flex-shrink-0">{{ source.percent }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Pipeline Status Summary -->
      <div class="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
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

      <div class="text-center text-[11px] text-[#94A3B8] pt-4 pb-6">
        © 2026 DDTech. All rights reserved.
      </div>

    </main>
  </MainLayout>
</template>