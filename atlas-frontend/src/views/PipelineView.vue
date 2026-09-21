<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import MainLayout from '../components/MainLayout.vue'
import api from '../services/api'
import { useToast } from '../composables/UseToast'
import { Kanban, List, Search, ChevronRight, ChevronDown, GripVertical, User } from '@lucide/vue'

const { showToast } = useToast()

// ==========================================
// 1. TIPE DATA & API FETCH
// ==========================================
interface Deal {
  id: string
  lead_id: string
  name: string
  company: string
  tier: 'Tier A' | 'Tier B' | 'Tier C' | string
  score: number
  owner: string
  stage: 'New Lead' | 'Qualified' | 'Contacted' | 'Meeting Requested' | 'Demo Scheduled' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost' | 'Disqualified'
  updated_at: string
}

type StageKey = Deal['stage']

const allDeals = ref<Deal[]>([])

const fetchDeals = async () => {
  try {
    const response = await api.get('/api/admin/leads')
    if (response.data.success) {
      allDeals.value = response.data.data.map((lead: any) => {
        let stageStr = lead.status || 'New Lead';
        
        // Map backend specific statuses to frontend StageKey
        if (stageStr === 'Demo' || stageStr === 'Demo Booked') stageStr = 'Demo Scheduled';
        if (stageStr === 'Proposal') stageStr = 'Proposal Sent';
        
        const validKeys = ['New Lead', 'Qualified', 'Contacted', 'Meeting Requested', 'Demo Scheduled', 'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'Disqualified'];
        if (!validKeys.includes(stageStr)) {
          stageStr = 'New Lead'; // Fallback to prevent app crash
        }

        return {
          id: lead.id,
          lead_id: lead.id,
          name: lead.full_name || lead.email || 'Unknown',
          company: lead.company_name || 'Unknown Company',
          tier: lead.lead_tier || 'Tier C',
          score: lead.lead_score || 0, 
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
  { key: 'Meeting Requested', label: 'Meeting Requested', color: '#A855F7' },
  { key: 'Demo Scheduled', label: 'Demo Scheduled', color: '#06B6D4' },
  { key: 'Proposal Sent', label: 'Proposal Sent', color: '#F59E0B' },
  { key: 'Negotiation', label: 'Negotiation', color: '#F97316' },
  { key: 'Won', label: 'Won', color: '#10B981' },
  { key: 'Lost', label: 'Lost', color: '#EF4444' },
  { key: 'Disqualified', label: 'Disqualified', color: '#6B7280' }
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
  Lost: true,
  Disqualified: true
})

const toggleCollapse = (stageKey: StageKey) => {
  collapsedStages.value[stageKey] = !collapsedStages.value[stageKey]
}

// ==========================================
// 3. LOGIKA VIRTUAL PAGINATION (LOAD MORE)
// ==========================================
const stageLimits = ref<Record<StageKey, number>>({
  'New Lead': 10, 'Qualified': 10, 'Contacted': 10, 'Meeting Requested': 10,
  'Demo Scheduled': 10, 'Proposal Sent': 10, 'Negotiation': 10, 'Won': 10, 'Lost': 10, 'Disqualified': 10
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

const getStageColor = (stageKey: StageKey) => {
  return stages.find(s => s.key === stageKey)?.color || '#64748B'
}

// ==========================================
// 5. DRAG AND DROP LOGIC (NATIVE HTML5)
// ==========================================
const kanbanColumns = ref<Record<StageKey, Deal[]>>({
  'New Lead': [], 'Qualified': [], 'Contacted': [], 'Meeting Requested': [], 'Demo Scheduled': [], 'Proposal Sent': [], 'Negotiation': [], 'Won': [], 'Lost': [], 'Disqualified': []
})

const rebuildColumns = () => {
  const cols: Record<StageKey, Deal[]> = {
    'New Lead': [], 'Qualified': [], 'Contacted': [], 'Meeting Requested': [], 'Demo Scheduled': [], 'Proposal Sent': [], 'Negotiation': [], 'Won': [], 'Lost': [], 'Disqualified': []
  }
  filteredDeals.value.forEach(deal => cols[deal.stage].push(deal))
  kanbanColumns.value = cols
}

watch([() => allDeals.value, searchQuery, selectedOwner, selectedTier], rebuildColumns, { immediate: true, deep: true })

// State untuk drag & drop
const draggedDealId = ref<string | null>(null)
const dragSourceStage = ref<StageKey | null>(null)
const dragOverStage = ref<StageKey | null>(null)
const dropTargetIndex = ref<number>(-1) // posisi drop indicator dalam kolom

const onDragStart = (dealId: string, stageKey: StageKey, event: DragEvent) => {
  draggedDealId.value = dealId
  dragSourceStage.value = stageKey
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', dealId)
  }
  const target = event.target as HTMLElement
  setTimeout(() => target.classList.add('opacity-40'), 0)
}

const onDragEnd = (event: DragEvent) => {
  draggedDealId.value = null
  dragSourceStage.value = null
  dragOverStage.value = null
  dropTargetIndex.value = -1
  const target = event.target as HTMLElement
  target.classList.remove('opacity-40')
}

const onDragOverColumn = (stageKey: StageKey, event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  dragOverStage.value = stageKey
  // Jika hover di area kosong kolom (bukan di atas card), drop di akhir
  const target = event.target as HTMLElement
  if (target.classList.contains('kanban-drop-zone')) {
    dropTargetIndex.value = kanbanColumns.value[stageKey].length
  }
}

const onDragOverCard = (stageKey: StageKey, cardIndex: number, event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  dragOverStage.value = stageKey
  // Tentukan posisi: atas atau bawah card berdasarkan posisi mouse
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const midY = rect.top + rect.height / 2
  dropTargetIndex.value = event.clientY < midY ? cardIndex : cardIndex + 1
}

const onDragLeaveColumn = (stageKey: StageKey, event: DragEvent) => {
  const relatedTarget = event.relatedTarget as HTMLElement | null
  const currentTarget = event.currentTarget as HTMLElement
  if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
    if (dragOverStage.value === stageKey) {
      dragOverStage.value = null
      dropTargetIndex.value = -1
    }
  }
}

const onDrop = async (targetStageKey: StageKey, event: DragEvent) => {
  event.preventDefault()
  const targetIndex = dropTargetIndex.value
  dragOverStage.value = null
  dropTargetIndex.value = -1

  const dealId = draggedDealId.value || event.dataTransfer?.getData('text/plain')
  if (!dealId) return

  const deal = allDeals.value.find(d => d.id === dealId)
  if (!deal) return

  const previousStage = deal.stage
  const sourceStage = dragSourceStage.value

  // === REORDER DALAM KOLOM YANG SAMA ===
  if (previousStage === targetStageKey && sourceStage === targetStageKey) {
    const column = kanbanColumns.value[targetStageKey]
    const fromIndex = column.findIndex(d => d.id === dealId)
    if (fromIndex !== -1 && targetIndex !== -1 && fromIndex !== targetIndex) {
      const removed = column.splice(fromIndex, 1)
      if (removed.length > 0) {
        const insertAt = targetIndex > fromIndex ? targetIndex - 1 : targetIndex
        const item = removed[0] as Deal
        column.splice(insertAt, 0, item)
      }
    }
    draggedDealId.value = null
    dragSourceStage.value = null
    return
  }

  // === PINDAH KE KOLOM LAIN ===
  deal.stage = targetStageKey
  deal.updated_at = new Date().toISOString().slice(0, 10)
  draggedDealId.value = null
  dragSourceStage.value = null

  // Rebuild columns lalu insert di posisi yang tepat
  rebuildColumns()
  if (targetIndex >= 0 && targetIndex < kanbanColumns.value[targetStageKey].length) {
    const col = kanbanColumns.value[targetStageKey]
    const currentIdx = col.findIndex(d => d.id === dealId)
    if (currentIdx !== -1 && currentIdx !== targetIndex) {
      const removed = col.splice(currentIdx, 1)
      if (removed.length > 0) {
        const insertAt = targetIndex > currentIdx ? targetIndex - 1 : targetIndex
        const item = removed[0] as Deal
        col.splice(insertAt, 0, item)
      }
    }
  }

  let backendStatus = targetStageKey

  // Persist ke backend
  try {
    await api.patch(`/api/admin/leads/${deal.id}`, { status: backendStatus })
    showToast('Deal status successfully updated', 'success')
  } catch (error) {
    console.error('Failed to update status in DB', error)
    showToast('Failed to update status to database', 'error')
    deal.stage = previousStage
    rebuildColumns()
  }
}

// ==========================================
// 6. STATE LOADING (SKELETON)
// ==========================================
const isLoading = ref(true)

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 1500)
})
</script>

<template>
  <MainLayout active-menu="pipeline">
    <main class="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300">
      
      <!-- HEADER & FILTER BAR -->
      <div class="p-4 sm:p-6 pb-4 border-b border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#0F172A] flex-shrink-0 shadow-sm z-10 transition-colors duration-300">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 class="text-[26px] sm:text-[32px] font-bold text-slate-900 dark:text-white">Sales Pipeline</h1>
            <p class="text-[14px] sm:text-[16px] text-slate-500 dark:text-slate-400">Track and manage leads as they move through every stage.</p>
          </div>
          
          <div class="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div class="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button 
                @click="viewMode = 'kanban'" 
                :class="['px-3 sm:px-4 py-1.5 text-[12px] sm:text-[13px] font-bold rounded-md transition flex items-center gap-2', viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white']"
              >
                <Kanban class="w-4 h-4" />
                <span class="hidden sm:block">Kanban</span>
              </button>
              <button 
                @click="viewMode = 'table'" 
                :class="['px-3 sm:px-4 py-1.5 text-[12px] sm:text-[13px] font-bold rounded-md transition flex items-center gap-2', viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white']"
              >
                <List class="w-4 h-4" />
                <span class="hidden sm:block">Table</span>
              </button>
            </div>

            <div class="text-[13px] sm:text-[14px] font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 sm:px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 whitespace-nowrap">
              Total Deals: <span class="text-blue-600 dark:text-blue-400 font-bold">{{ filteredDeals.length }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <div class="relative flex-1 min-w-[150px] max-w-xs">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Cari deal / perusahaan..."
              class="w-full text-[12px] sm:text-[13px] border border-slate-200 dark:border-slate-700 rounded-lg pl-8 sm:pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900/50 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-600 transition-colors"
            />
            <Search class="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
          </div>

          <select v-model="selectedOwner" class="text-[12px] sm:text-[13px] font-medium border border-slate-200 dark:border-slate-700 rounded-lg px-2 sm:px-3 py-2 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer">
            <option value="All">Semua Owner</option>
            <option value="AC (Aldean)">AC (Aldean)</option>
            <option value="JM (Jordan)">JM (Jordan)</option>
          </select>

          <select v-model="selectedTier" class="text-[12px] sm:text-[13px] font-medium border border-slate-200 dark:border-slate-700 rounded-lg px-2 sm:px-3 py-2 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer">
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
      <div v-if="viewMode === 'kanban'" class="flex-1 overflow-x-auto p-4 sm:p-6 flex gap-4 items-start custom-scrollbar animate-fade-in">
        
        <div 
          v-for="stage in stages" 
          :key="stage.key"
          :class="[
            'bg-slate-100/80 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-col h-full max-h-full transition-all duration-300 ease-in-out',
            collapsedStages[stage.key] ? 'w-[50px] sm:w-[60px] flex-shrink-0 items-center py-4 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700' : 'w-[280px] sm:w-[300px] flex-shrink-0 p-3'
          ]"
          @click="collapsedStages[stage.key] ? toggleCollapse(stage.key) : null"
        >
          <div v-if="collapsedStages[stage.key]" class="flex flex-col items-center h-full justify-between gap-4">
            <button @click.stop="toggleCollapse(stage.key)" class="p-1.5 hover:bg-white rounded-lg text-slate-500 shadow-sm transition" title="Buka Kolom">
              <ChevronRight class="w-4 h-4" />
            </button>
            <span class="text-[13px] font-bold text-slate-600 tracking-wider [writing-mode:vertical-lr] rotate-180 select-none">
              {{ stage.label }} ({{ kanbanColumns[stage.key].length }})
            </span>
            <div class="w-3 h-3 rounded-full shadow-sm" :style="{ backgroundColor: stage.color }"></div>
          </div>

          <template v-else>
            <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-200/60 shrink-0">
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: stage.color }"></div>
                <h2 class="text-[14px] font-bold text-slate-900 dark:text-white">{{ stage.label }}</h2>
                <span class="text-[11px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                  {{ kanbanColumns[stage.key].length }}
                </span>
              </div>
              
              <div class="flex items-center gap-2">
                <button @click.stop="toggleCollapse(stage.key)" class="p-1 hover:bg-gray-200 rounded text-slate-400 hover:text-slate-900 transition" title="Ciutkan Kolom">
                  <ChevronDown class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- JIKA SEDANG LOADING (TAMPILKAN SKELETON KARTU) -->
            <div v-if="isLoading" class="flex-1 overflow-hidden space-y-3 pr-1 mt-2">
              <div v-for="i in 3" :key="i" class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm animate-pulse">
                <div class="flex justify-between mb-3">
                  <div class="h-3 bg-gray-200 rounded w-12"></div>
                  <div class="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div class="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div class="flex justify-between pt-3 border-t border-gray-100">
                  <div class="h-3 bg-gray-200 rounded w-16"></div>
                  <div class="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>

            <!-- JIKA LOADING SELESAI (NATIVE HTML5 DRAG & DROP) -->
            <div 
              v-else
              class="kanban-drop-zone flex-1 overflow-y-auto pr-1 min-h-[150px] custom-scrollbar-vertical transition-colors duration-200 rounded-lg"
              :class="dragOverStage === stage.key && draggedDealId ? 'bg-blue-50/60 ring-2 ring-blue-300/50 ring-inset' : ''"
              @dragover="onDragOverColumn(stage.key, $event)"
              @dragleave="onDragLeaveColumn(stage.key, $event)"
              @drop="onDrop(stage.key, $event)"
            >
              <!-- Kolom kosong: drop target placeholder -->
              <div v-if="kanbanColumns[stage.key].length === 0" class="h-24 flex items-center justify-center border-2 border-dashed rounded-lg text-[12px] bg-white/50 dark:bg-[#0F172A]/50 transition-colors duration-200" :class="dragOverStage === stage.key ? 'border-blue-400 text-blue-500' : 'border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500'">
                Drop deal di sini
              </div>

              <!-- Card items with drop indicators -->
              <template v-for="(deal, index) in kanbanColumns[stage.key]" :key="deal.id">
                <!-- Drop indicator SEBELUM card -->
                <div 
                  v-if="draggedDealId && dragOverStage === stage.key && dropTargetIndex === index && draggedDealId !== deal.id"
                  class="h-1 bg-blue-500 rounded-full mx-1 my-1 transition-all duration-150"
                ></div>

                <div 
                  v-show="index < stageLimits[stage.key]" 
                  draggable="true"
                  @dragstart="onDragStart(deal.id, stage.key, $event)"
                  @dragend="onDragEnd($event)"
                  @dragover="onDragOverCard(stage.key, index, $event)"
                  class="bg-white dark:bg-[#0F172A] p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/50 cursor-grab active:cursor-grabbing transition-all duration-200 group flex items-start gap-2 mb-3"
                >
                  <div class="md:hidden flex items-center text-slate-300 group-hover:text-slate-400 pt-0.5 transition-colors flex-shrink-0">
                    <GripVertical class="w-5 h-5" />
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1.5">
                      <span 
                        :class="[
                          'text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap',
                          deal.tier === 'Tier A' ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]' :
                          deal.tier === 'Tier B' ? 'bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]' :
                          deal.tier === 'Tier C' ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]' :
                          deal.tier === 'Spam' ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]' :
                          'bg-slate-50 text-slate-500 border-slate-200'
                        ]"
                      >
                        {{ deal.tier }}
                      </span>
                      <span class="text-[13px] font-bold text-slate-900">Score: {{ deal.score }}/5</span>
                    </div>

                    <h3 class="text-[13px] font-bold text-slate-900 dark:text-white leading-snug truncate">{{ deal.company }}</h3>
                    <p class="text-[12px] text-slate-500 dark:text-slate-400 mb-3 truncate">{{ deal.name }}</p>

                    <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/50 text-[11px] text-slate-400 dark:text-slate-500 transition-colors">
                      <span class="font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <User class="w-3 h-3" />
                        {{ deal.owner }}
                      </span>
                      <span>{{ deal.updated_at }}</span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Drop indicator SETELAH card terakhir -->
              <div 
                v-if="draggedDealId && dragOverStage === stage.key && dropTargetIndex === kanbanColumns[stage.key].length && kanbanColumns[stage.key].length > 0"
                class="h-1 bg-blue-500 rounded-full mx-1 my-1 transition-all duration-150"
              ></div>
            </div>

            <div v-if="!isLoading && kanbanColumns[stage.key].length > stageLimits[stage.key]" class="pt-2 pb-1">
              <button 
                @click="loadMore(stage.key)"
                class="w-full py-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors border border-blue-100 dark:border-blue-800/50"
              >
                Load +10 More
              </button>
            </div>
          </template>
        </div>
      </div>

      <!-- ==========================================
           TAMPILAN TABLE (CLEAN & SCANNABLE)
      ========================================== -->
      <div v-else class="flex-1 p-4 sm:p-6 bg-slate-50 dark:bg-[#0B1120] animate-fade-in transition-colors duration-300">
        <div class="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/50 rounded-xl shadow-sm overflow-x-auto custom-scrollbar transition-colors">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr class="bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800/50 text-[12px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider transition-colors">
                <th class="p-4 pl-6 whitespace-nowrap">Company & Contact</th>
                <th class="p-4 whitespace-nowrap">Stage</th>
                <th class="p-4 whitespace-nowrap">Tier</th>
                <th class="p-4 whitespace-nowrap">Owner</th>
                <th class="p-4 text-right whitespace-nowrap">Score</th>
                <th class="p-4 pr-6 text-right whitespace-nowrap">Last Updated</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800/50">
              
              <!-- JIKA SEDANG LOADING (TAMPILKAN SKELETON TABEL) -->
              <template v-if="isLoading">
                <tr v-for="i in 6" :key="'skeleton-'+i">
                  <td class="p-4 pl-6">
                    <div class="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                    <div class="h-3 bg-gray-100 rounded w-24 animate-pulse"></div>
                  </td>
                  <td class="p-4"><div class="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></td>
                  <td class="p-4"><div class="h-5 bg-gray-200 rounded w-16 animate-pulse"></div></td>
                  <td class="p-4"><div class="h-6 bg-gray-200 rounded w-24 animate-pulse"></div></td>
                  <td class="p-4"><div class="h-4 bg-gray-200 rounded w-20 ml-auto animate-pulse"></div></td>
                  <td class="p-4"><div class="h-4 bg-gray-200 rounded w-24 ml-auto animate-pulse"></div></td>
                </tr>
              </template>

              <!-- JIKA LOADING SELESAI (TAMPILKAN DATA ASLI) -->
              <template v-else>
                <tr v-for="deal in filteredDeals" :key="deal.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td class="p-4 pl-6">
                    <div class="font-bold text-slate-900 dark:text-white text-[14px] whitespace-nowrap">{{ deal.company }}</div>
                    <div class="text-[13px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{{ deal.name }}</div>
                  </td>
                  
                  <td class="p-4">
                    <div class="flex items-center gap-2">
                      <div class="w-2.5 h-2.5 rounded-full shadow-sm flex-shrink-0" :style="{ backgroundColor: getStageColor(deal.stage) }"></div>
                      <span class="text-[13px] font-semibold text-slate-900 dark:text-white whitespace-nowrap">{{ deal.stage }}</span>
                    </div>
                  </td>

                  <td class="p-4">
                    <span 
                      :class="[
                        'text-[11px] font-bold px-2.5 py-1 rounded-md border whitespace-nowrap',
                        deal.tier === 'Tier A' ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]' :
                        deal.tier === 'Tier B' ? 'bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]' :
                        deal.tier === 'Tier C' ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]' :
                        deal.tier === 'Spam' ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]' :
                        'bg-slate-50 text-slate-500 border-slate-200'
                      ]"
                    >
                      {{ deal.tier }}
                    </span>
                  </td>

                  <td class="p-4">
                    <span class="text-[13px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-colors">
                      {{ deal.owner }}
                    </span>
                  </td>

                  <td class="p-4 text-right font-bold text-slate-900 dark:text-white text-[14px]">
                    {{ deal.score }}/5
                  </td>

                  <td class="p-4 pr-6 text-right text-[13px] text-slate-500 dark:text-slate-400">
                    {{ deal.updated_at }}
                  </td>
                </tr>

                <tr v-if="filteredDeals.length === 0">
                  <td colspan="6" class="p-12 text-center text-[13px] text-slate-400 dark:text-slate-500">
                    Tidak ada data deal yang ditemukan dengan filter saat ini.
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

    </main>
  </MainLayout>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

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

.custom-scrollbar-vertical::-webkit-scrollbar { 
  width: 4px; 
}
.custom-scrollbar-vertical::-webkit-scrollbar-track { 
  background: transparent; 
}
.custom-scrollbar-vertical::-webkit-scrollbar-thumb { 
  background-color: #cbd5e1; 
  border-radius: 4px; 
}
</style>