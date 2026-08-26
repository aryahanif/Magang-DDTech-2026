<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MainLayout from '../components/MainLayout.vue'
import api from '../services/api'

// ==========================================
// 1. TIPE DATA & API FETCH
// ==========================================
interface Deal {
  id: string
  lead_id: string
  name: string
  company: string
  tier: 'Tier A' | 'Tier B' | 'Tier C' | string
  value: number
  owner: string
  stage: 'New Lead' | 'Qualified' | 'Contacted' | 'Demo Scheduled' | 'Proposal Sent' | 'Won' | 'Lost'
  updated_at: string
}

type StageKey = Deal['stage']

const allDeals = ref<Deal[]>([])

const fetchDeals = async () => {
  try {
    const response = await api.get('/api/leads')
    if (response.data.success) {
      allDeals.value = response.data.data.map((lead: any) => {
        let stageStr = lead.status || 'New Lead';
        if (stageStr === 'Demo' || stageStr === 'Demo Booked') stageStr = 'Demo Scheduled';
        if (stageStr === 'Proposal') stageStr = 'Proposal Sent';

        return {
          id: lead.id,
          lead_id: lead.id,
          name: lead.full_name || lead.email || 'Unknown',
          company: lead.company_name || 'Unknown Company',
          tier: lead.lead_tier || 'Tier C',
          value: lead.lead_score ? lead.lead_score * 1000 : 0, 
          owner: lead.assigned_owner || 'Unassigned',
          stage: stageStr as StageKey,
          updated_at: new Date(lead.updated_at || lead.created_at).toISOString().slice(0, 10)
        }
      })
    }
  } catch(error) {
    console.error("Failed to fetch leads for pipeline", error)
  }
}

onMounted(() => fetchDeals())

const stages: { key: StageKey; label: string; color: string }[] = [
  { key: 'New Lead', label: 'New Lead', color: '#64748B' },
  { key: 'Qualified', label: 'Qualified', color: '#3B82F6' },
  { key: 'Contacted', label: 'Contacted', color: '#8B5CF6' },
  { key: 'Demo Scheduled', label: 'Demo Scheduled', color: '#06B6D4' },
  { key: 'Proposal Sent', label: 'Proposal Sent', color: '#F59E0B' },
  { key: 'Won', label: 'Won', color: '#10B981' },
  { key: 'Lost', label: 'Lost', color: '#EF4444' }
]

// ==========================================
// 2. STATE MANAJEMEN & VIEW MODE
// ==========================================
const viewMode = ref<'kanban' | 'table'>('kanban')

const searchQuery = ref('')
const selectedOwner = ref('All')
const selectedTier = ref('All')

const collapsedStages = ref<Partial<Record<StageKey, boolean>>>({
  Won: true,  
  Lost: true  
})

const toggleCollapse = (stageKey: StageKey) => {
  collapsedStages.value[stageKey] = !collapsedStages.value[stageKey]
}

// ==========================================
// 3. LOGIKA VIRTUAL PAGINATION (LOAD MORE)
// ==========================================
const stageLimits = ref<Record<StageKey, number>>({
  'New Lead': 10, 'Qualified': 10, 'Contacted': 10, 
  'Demo Scheduled': 10, 'Proposal Sent': 10, 'Won': 10, 'Lost': 10
})

const loadMore = (stageKey: StageKey) => {
  stageLimits.value[stageKey] = (stageLimits.value[stageKey] || 10) + 10
}

// ==========================================
// 4. COMPUTED PROPERTIES & FORMATTING
// ==========================================
const filteredDeals = computed(() => {
  return allDeals.value.filter(deal => {
    const matchSearch = deal.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                        deal.company.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchOwner = selectedOwner.value === 'All' || deal.owner === selectedOwner.value
    const matchTier = selectedTier.value === 'All' || deal.tier === selectedTier.value
    return matchSearch && matchOwner && matchTier
  })
})

const getDealsByStage = (stageKey: StageKey) => {
  return filteredDeals.value.filter(deal => deal.stage === stageKey)
}

const getStageTotalValue = (stageKey: StageKey) => {
  return getDealsByStage(stageKey).reduce((acc, curr) => acc + curr.value, 0)
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
}

const getStageColor = (stageKey: StageKey) => {
  return stages.find(s => s.key === stageKey)?.color || '#64748B'
}

// ==========================================
// 5. DRAG AND DROP LOGIC
// ==========================================
const draggedDealId = ref<string | null>(null)

const handleDragStart = (dealId: string) => {
  draggedDealId.value = dealId
}

const handleDrop = async (targetStage: Deal['stage']) => {
  if (draggedDealId.value === null) return
  const targetDeal = allDeals.value.find(d => d.id === draggedDealId.value)
  if (targetDeal) {
    const previousStage = targetDeal.stage;
    targetDeal.stage = targetStage
    targetDeal.updated_at = new Date().toISOString().slice(0, 10)

    let backendStatus = targetStage as string;
    if (backendStatus === 'Demo Scheduled') backendStatus = 'Demo';
    if (backendStatus === 'Proposal Sent') backendStatus = 'Proposal';

    try {
      await api.patch(`/api/leads/${targetDeal.id}`, { status: backendStatus })
    } catch(error) {
      console.error("Failed to update status in DB", error)
      targetDeal.stage = previousStage // revert on failure
    }
  }
  draggedDealId.value = null
}
</script>

<template>
  <MainLayout active-menu="pipeline">
    <main class="flex-1 flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
      
      <!-- ==========================================
           HEADER & FILTER BAR 
      ========================================== -->
      <div class="p-6 pb-4 border-b border-[#E2E8F0] bg-white shrink-0 shadow-sm z-10">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 class="text-[32px] font-bold text-[#0F172A]">Sales Pipeline</h1>
            <p class="text-[16px] text-[#64748B]">Track and manage leads as they move through every stage.</p>
          </div>
          
          <div class="flex items-center gap-4">
            <!-- TOGGLE VIEW MODE -->
            <div class="flex items-center bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0]">
              <button 
                @click="viewMode = 'kanban'" 
                :class="['px-4 py-1.5 text-[13px] font-bold rounded-md transition flex items-center gap-2', viewMode === 'kanban' ? 'bg-white shadow-sm text-[#0F172A]' : 'text-[#64748B] hover:text-[#0F172A]']"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/></svg>
                Kanban
              </button>
              <button 
                @click="viewMode = 'table'" 
                :class="['px-4 py-1.5 text-[13px] font-bold rounded-md transition flex items-center gap-2', viewMode === 'table' ? 'bg-white shadow-sm text-[#0F172A]' : 'text-[#64748B] hover:text-[#0F172A]']"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                Table
              </button>
            </div>

            <!-- TOTAL VALUE -->
            <div class="text-[14px] font-semibold text-[#0F172A] bg-[#F1F5F9] px-4 py-2 rounded-lg border border-[#E2E8F0]">
              Total: <span class="text-[#2563EB] font-bold">{{ formatCurrency(filteredDeals.reduce((acc, d) => acc + d.value, 0)) }}</span>
            </div>
          </div>
        </div>

        <!-- QUICK FILTERS -->
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative flex-1 min-w-50 max-w-xs">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search by name or company..."
              class="w-full text-[13px] border border-[#E2E8F0] rounded-lg pl-9 pr-3 py-2 bg-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-colors"
            />
            <svg class="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>

          <select v-model="selectedOwner" class="text-[13px] font-medium border border-[#E2E8F0] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer">
            <option value="All">Semua Owner</option>
            <option value="AC (Aldean)">AC (Aldean)</option>
            <option value="JM (Jordan)">JM (Jordan)</option>
          </select>

          <select v-model="selectedTier" class="text-[13px] font-medium border border-[#E2E8F0] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer">
            <option value="All">Semua Tier</option>
            <option value="Tier A">Tier A (High Fit)</option>
            <option value="Tier B">Tier B (Medium)</option>
            <option value="Tier C">Tier C (Low Fit)</option>
          </select>
        </div>
      </div>

      <!-- ==========================================
           TAMPILAN KANBAN (DRAG & DROP)
      ========================================== -->
      <div v-if="viewMode === 'kanban'" class="flex-1 overflow-x-auto p-6 flex gap-4 items-start custom-scrollbar animate-fade-in">
        <!-- COLUMN PER STAGE -->
        <div 
          v-for="stage in stages" 
          :key="stage.key"
          @dragover.prevent
          @drop="handleDrop(stage.key)"
          :class="[
            'flex flex-col bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl overflow-hidden transition-all duration-300',
            collapsedStages[stage.key] ? 'w-15 shrink-0 items-center py-4 cursor-pointer hover:bg-[#E2E8F0]' : 'w-75 shrink-0 p-3'
          ]"
          @click="collapsedStages[stage.key] ? toggleCollapse(stage.key) : null"
        >
          <!-- HEADER: COLLAPSED MODE -->
          <div v-if="collapsedStages[stage.key]" class="flex flex-col items-center h-full justify-between gap-4">
            <button @click.stop="toggleCollapse(stage.key)" class="p-1.5 hover:bg-white rounded-lg text-[#64748B] shadow-sm transition" title="Buka Kolom">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
            <span class="text-[13px] font-bold text-[#475569] tracking-wider [writing-mode:vertical-lr] rotate-180 select-none">
              {{ stage.label }} ({{ getDealsByStage(stage.key).length }})
            </span>
            <div class="w-3 h-3 rounded-full shadow-sm" :style="{ backgroundColor: stage.color }"></div>
          </div>

          <!-- HEADER: EXPANDED MODE -->
          <template v-else>
            <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-200/60 shrink-0">
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: stage.color }"></div>
                <h2 class="text-[14px] font-bold text-[#0F172A]">{{ stage.label }}</h2>
                <span class="text-[11px] font-semibold bg-[#E2E8F0] text-[#475569] px-2 py-0.5 rounded-full">
                  {{ getDealsByStage(stage.key).length }}
                </span>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-bold text-[#64748B]">{{ formatCurrency(getStageTotalValue(stage.key)) }}</span>
                <button @click="toggleCollapse(stage.key)" class="p-1 hover:bg-gray-200 rounded text-[#94A3B8] hover:text-[#0F172A] transition" title="Ciutkan Kolom">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
              </div>
            </div>

            <!-- CARDS LIST -->
            <div class="flex-1 overflow-y-auto space-y-3 pr-1 min-h-37.5 custom-scrollbar">
              <div 
                v-for="deal in getDealsByStage(stage.key).slice(0, stageLimits[stage.key])"
                :key="deal.id"
                draggable="true"
                @dragstart="handleDragStart(deal.id)"
                class="bg-white p-3.5 rounded-lg border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-blue-200 cursor-grab transition-all duration-200"
              >
                <!-- Tier & Value -->
                <div class="flex items-center justify-between mb-1.5">
                  <span 
                    :class="[
                      'text-[10px] font-bold px-2 py-0.5 rounded border',
                      deal.tier === 'Tier A' ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]' :
                      deal.tier === 'Tier B' ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]' :
                      'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
                    ]"
                  >
                    {{ deal.tier }}
                  </span>
                  <span class="text-[13px] font-bold text-[#0F172A]">{{ formatCurrency(deal.value) }}</span>
                </div>

                <!-- Company & Lead Name -->
                <h3 class="text-[13px] font-bold text-[#0F172A] leading-snug">{{ deal.company }}</h3>
                <p class="text-[12px] text-[#64748B] mb-3">{{ deal.name }}</p>

                <!-- Footer Info -->
                <div class="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-[#94A3B8]">
                  <span class="font-medium text-[#475569] flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    {{ deal.owner }}
                  </span>
                  <span>{{ deal.updated_at }}</span>
                </div>
              </div>

              <!-- LOAD MORE BUTTON -->
              <div v-if="getDealsByStage(stage.key).length > (stageLimits[stage.key] || 10)" class="pt-2 pb-1">
                <button 
                  @click="loadMore(stage.key)"
                  class="w-full py-2 text-[11px] font-bold text-[#2563EB] bg-blue-50 hover:bg-blue-100 rounded-lg transition border border-blue-100"
                >
                  Load +10 More
                </button>
              </div>

              <!-- Empty State -->
              <div v-if="getDealsByStage(stage.key).length === 0" class="h-24 flex items-center justify-center border-2 border-dashed border-[#CBD5E1] rounded-lg text-[12px] text-[#94A3B8] bg-white/50">
                Belum ada data
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- ==========================================
           TAMPILAN TABLE (CLEAN & SCANNABLE)
      ========================================== -->
      <!-- Menambahkan class animate-fade-in di sini -->
      <div v-else class="flex-1 overflow-auto p-6 bg-[#F8FAFC] custom-scrollbar animate-fade-in">
        <div class="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#F1F5F9] border-b border-[#E2E8F0] text-[12px] font-bold text-[#475569] uppercase tracking-wider">
                <th class="p-4 pl-6">Company & Contact</th>
                <th class="p-4">Stage</th>
                <th class="p-4">Tier</th>
                <th class="p-4">Owner</th>
                <th class="p-4 text-right">Value</th>
                <th class="p-4 pr-6 text-right">Last Updated</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E2E8F0]">
              <tr v-for="deal in filteredDeals" :key="deal.id" class="hover:bg-[#F8FAFC] transition">
                <!-- Kolom Perusahaan & Kontak -->
                <td class="p-4 pl-6">
                  <div class="font-bold text-[#0F172A] text-[14px]">{{ deal.company }}</div>
                  <div class="text-[13px] text-[#64748B]">{{ deal.name }}</div>
                </td>
                
                <!-- Kolom Stage -->
                <td class="p-4">
                  <div class="flex items-center gap-2">
                    <div class="w-2.5 h-2.5 rounded-full shadow-sm" :style="{ backgroundColor: getStageColor(deal.stage) }"></div>
                    <span class="text-[13px] font-semibold text-[#0F172A]">{{ deal.stage }}</span>
                  </div>
                </td>

                <!-- Kolom Tier -->
                <td class="p-4">
                  <span 
                    :class="[
                      'text-[11px] font-bold px-2.5 py-1 rounded-md border',
                      deal.tier === 'Tier A' ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]' :
                      deal.tier === 'Tier B' ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]' :
                      'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
                    ]"
                  >
                    {{ deal.tier }}
                  </span>
                </td>

                <!-- Kolom Owner -->
                <td class="p-4">
                  <span class="text-[13px] font-medium text-[#475569] bg-[#F1F5F9] px-2.5 py-1 rounded-md border border-[#E2E8F0]">
                    {{ deal.owner }}
                  </span>
                </td>

                <!-- Kolom Value -->
                <td class="p-4 text-right font-bold text-[#0F172A] text-[14px]">
                  {{ formatCurrency(deal.value) }}
                </td>

                <!-- Kolom Tanggal -->
                <td class="p-4 pr-6 text-right text-[13px] text-[#64748B]">
                  {{ deal.updated_at }}
                </td>
              </tr>

              <!-- State Kosong untuk Tabel -->
              <tr v-if="filteredDeals.length === 0">
                <td colspan="6" class="p-12 text-center text-[13px] text-[#94A3B8]">
                  Tidak ada data deal yang ditemukan dengan filter saat ini.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </main>
  </MainLayout>
</template>

<style scoped>
/* Animasi Fade In seperti halaman Settings */
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Styling Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #CBD5E1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #94A3B8;
}
</style>