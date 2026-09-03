<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import MainLayout from '../components/MainLayout.vue'
import api from '../services/api'
import { useToast } from '../composables/UseToast'

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

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
}

const getStageColor = (stageKey: StageKey) => {
  return stages.find(s => s.key === stageKey)?.color || '#64748B'
}

// ==========================================
// 5. DRAG AND DROP LOGIC (NATIVE HTML5)
// ==========================================
const kanbanColumns = ref<Record<StageKey, Deal[]>>({
  'New Lead': [], 'Qualified': [], 'Contacted': [], 'Demo Scheduled': [], 'Proposal Sent': [], 'Won': [], 'Lost': []
})

const rebuildColumns = () => {
  const cols: Record<StageKey, Deal[]> = {
    'New Lead': [], 'Qualified': [], 'Contacted': [], 'Demo Scheduled': [], 'Proposal Sent': [], 'Won': [], 'Lost': []
  }
  filteredDeals.value.forEach(deal => cols[deal.stage].push(deal))
  kanbanColumns.value = cols
}

watch([() => allDeals.value, searchQuery, selectedOwner, selectedTier], rebuildColumns, { immediate: true, deep: true })

const getStageTotalValue = (stageKey: StageKey) => {
  return kanbanColumns.value[stageKey]?.reduce((acc, curr) => acc + curr.value, 0) || 0
}

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
    await api.patch(`/api/leads/${deal.id}`, { status: backendStatus })
    showToast('Status deal berhasil diperbarui', 'success')
  } catch (error) {
    console.error('Failed to update status in DB', error)
    showToast('Gagal memperbarui status ke database', 'error')
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
    <main class="flex-1 flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
      
      <!-- HEADER & FILTER BAR -->
      <div class="p-4 sm:p-6 pb-4 border-b border-[#E2E8F0] bg-white flex-shrink-0 shadow-sm z-10">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 class="text-[26px] sm:text-[32px] font-bold text-[#0F172A]">Sales Pipeline</h1>
            <p class="text-[14px] sm:text-[16px] text-[#64748B]">Track and manage leads as they move through every stage.</p>
          </div>
          
          <div class="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div class="flex items-center bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0]">
              <button 
                @click="viewMode = 'kanban'" 
                :class="['px-3 sm:px-4 py-1.5 text-[12px] sm:text-[13px] font-bold rounded-md transition flex items-center gap-2', viewMode === 'kanban' ? 'bg-white shadow-sm text-[#0F172A]' : 'text-[#64748B] hover:text-[#0F172A]']"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/></svg>
                <span class="hidden sm:block">Kanban</span>
              </button>
              <button 
                @click="viewMode = 'table'" 
                :class="['px-3 sm:px-4 py-1.5 text-[12px] sm:text-[13px] font-bold rounded-md transition flex items-center gap-2', viewMode === 'table' ? 'bg-white shadow-sm text-[#0F172A]' : 'text-[#64748B] hover:text-[#0F172A]']"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                <span class="hidden sm:block">Table</span>
              </button>
            </div>

            <div class="text-[13px] sm:text-[14px] font-semibold text-[#0F172A] bg-[#F1F5F9] px-3 sm:px-4 py-2 rounded-lg border border-[#E2E8F0] whitespace-nowrap">
              Total: <span class="text-[#2563EB] font-bold">{{ formatCurrency(filteredDeals.reduce((acc, d) => acc + d.value, 0)) }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <div class="relative flex-1 min-w-[150px] max-w-xs">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Cari deal / perusahaan..."
              class="w-full text-[12px] sm:text-[13px] border border-[#E2E8F0] rounded-lg pl-8 sm:pl-9 pr-3 py-2 bg-[#F8FAFC] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#2563EB] transition-colors"
            />
            <svg class="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>

          <select v-model="selectedOwner" class="text-[12px] sm:text-[13px] font-medium border border-[#E2E8F0] rounded-lg px-2 sm:px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer">
            <option value="All">Semua Owner</option>
            <option value="AC (Aldean)">AC (Aldean)</option>
            <option value="JM (Jordan)">JM (Jordan)</option>
          </select>

          <select v-model="selectedTier" class="text-[12px] sm:text-[13px] font-medium border border-[#E2E8F0] rounded-lg px-2 sm:px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer">
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
            'bg-[#F1F5F9]/80 rounded-xl border border-[#E2E8F0] flex flex-col h-full max-h-full transition-all duration-300 ease-in-out',
            collapsedStages[stage.key] ? 'w-[50px] sm:w-[60px] flex-shrink-0 items-center py-4 cursor-pointer hover:bg-[#E2E8F0]' : 'w-[280px] sm:w-[300px] flex-shrink-0 p-3'
          ]"
          @click="collapsedStages[stage.key] ? toggleCollapse(stage.key) : null"
        >
          <div v-if="collapsedStages[stage.key]" class="flex flex-col items-center h-full justify-between gap-4">
            <button @click.stop="toggleCollapse(stage.key)" class="p-1.5 hover:bg-white rounded-lg text-[#64748B] shadow-sm transition" title="Buka Kolom">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
            <span class="text-[13px] font-bold text-[#475569] tracking-wider [writing-mode:vertical-lr] rotate-180 select-none">
              {{ stage.label }} ({{ kanbanColumns[stage.key].length }})
            </span>
            <div class="w-3 h-3 rounded-full shadow-sm" :style="{ backgroundColor: stage.color }"></div>
          </div>

          <template v-else>
            <div class="flex items-center justify-between mb-3 pb-2 border-b border-gray-200/60 shrink-0">
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: stage.color }"></div>
                <h2 class="text-[14px] font-bold text-[#0F172A]">{{ stage.label }}</h2>
                <span class="text-[11px] font-semibold bg-[#E2E8F0] text-[#475569] px-2 py-0.5 rounded-full">
                  {{ kanbanColumns[stage.key].length }}
                </span>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-bold text-[#64748B]">{{ formatCurrency(getStageTotalValue(stage.key)) }}</span>
                <button @click.stop="toggleCollapse(stage.key)" class="p-1 hover:bg-gray-200 rounded text-[#94A3B8] hover:text-[#0F172A] transition" title="Ciutkan Kolom">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
              </div>
            </div>

            <!-- JIKA SEDANG LOADING (TAMPILKAN SKELETON KARTU) -->
            <div v-if="isLoading" class="flex-1 overflow-hidden space-y-3 pr-1 mt-2">
              <div v-for="i in 3" :key="i" class="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm animate-pulse">
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
              <div v-if="kanbanColumns[stage.key].length === 0" class="h-24 flex items-center justify-center border-2 border-dashed rounded-lg text-[12px] bg-white/50 transition-colors duration-200" :class="dragOverStage === stage.key ? 'border-blue-400 text-blue-500' : 'border-[#CBD5E1] text-[#94A3B8]'">
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
                  class="bg-white p-3.5 rounded-lg border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-blue-200 cursor-grab active:cursor-grabbing transition-all duration-200 group flex items-start gap-2 mb-3"
                >
                  <div class="md:hidden flex items-center text-[#CBD5E1] group-hover:text-[#94A3B8] pt-0.5 transition-colors flex-shrink-0">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0Zm0 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0Zm0 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0Zm9-12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0Zm0 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0Zm0 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0Z" />
                    </svg>
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1.5">
                      <span 
                        :class="[
                          'text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap',
                          deal.tier === 'Tier A' ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]' :
                          deal.tier === 'Tier B' ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]' :
                          deal.tier === 'Tier C' ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]' :
                          deal.tier === 'Spam' ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]' :
                          'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
                        ]"
                      >
                        {{ deal.tier }}
                      </span>
                      <span class="text-[13px] font-bold text-[#0F172A]">{{ formatCurrency(deal.value) }}</span>
                    </div>

                    <h3 class="text-[13px] font-bold text-[#0F172A] leading-snug truncate">{{ deal.company }}</h3>
                    <p class="text-[12px] text-[#64748B] mb-3 truncate">{{ deal.name }}</p>

                    <div class="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-[#94A3B8]">
                      <span class="font-medium text-[#475569] flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
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
                class="w-full py-2 text-[11px] font-bold text-[#2563EB] bg-blue-50 hover:bg-blue-100 rounded-lg transition border border-blue-100"
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
      <div v-else class="flex-1 overflow-auto p-4 sm:p-6 bg-[#F8FAFC] custom-scrollbar animate-fade-in">
        <div class="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
          <table class="w-full text-left border-collapse min-w-[700px]">
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
                <tr v-for="deal in filteredDeals" :key="deal.id" class="hover:bg-[#F8FAFC] transition">
                  <td class="p-4 pl-6">
                    <div class="font-bold text-[#0F172A] text-[14px]">{{ deal.company }}</div>
                    <div class="text-[13px] text-[#64748B]">{{ deal.name }}</div>
                  </td>
                  
                  <td class="p-4">
                    <div class="flex items-center gap-2">
                      <div class="w-2.5 h-2.5 rounded-full shadow-sm" :style="{ backgroundColor: getStageColor(deal.stage) }"></div>
                      <span class="text-[13px] font-semibold text-[#0F172A]">{{ deal.stage }}</span>
                    </div>
                  </td>

                  <td class="p-4">
                    <span 
                      :class="[
                        'text-[11px] font-bold px-2.5 py-1 rounded-md border',
                        deal.tier === 'Tier A' ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]' :
                        deal.tier === 'Tier B' ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]' :
                        deal.tier === 'Tier C' ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]' :
                        deal.tier === 'Spam' ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]' :
                        'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
                      ]"
                    >
                      {{ deal.tier }}
                    </span>
                  </td>

                  <td class="p-4">
                    <span class="text-[13px] font-medium text-[#475569] bg-[#F1F5F9] px-2.5 py-1 rounded-md border border-[#E2E8F0]">
                      {{ deal.owner }}
                    </span>
                  </td>

                  <td class="p-4 text-right font-bold text-[#0F172A] text-[14px]">
                    {{ formatCurrency(deal.value) }}
                  </td>

                  <td class="p-4 pr-6 text-right text-[13px] text-[#64748B]">
                    {{ deal.updated_at }}
                  </td>
                </tr>

                <tr v-if="filteredDeals.length === 0">
                  <td colspan="6" class="p-12 text-center text-[13px] text-[#94A3B8]">
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
  background-color: #E2E8F0; 
  border-radius: 4px; 
}
</style>