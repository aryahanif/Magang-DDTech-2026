<script setup lang="ts">
import { ref } from 'vue'
import MainLayout from '../components/MainLayout.vue'

// ==========================================
// DATA STATE & FILTER
// ==========================================

const searchQuery = ref('')
const selectedTier = ref('')
const selectedOwner = ref('')

const isAddLeadModalOpen = ref(false)
const newLeadForm = ref({
  name: '',
  company: '',
  value: 0,
  tier: 'Tier A',
  owner: 'AC'
})

// Definisi Kolom Kanban (Lengkap 6 Tahapan)
const pipelineColumns = [
  { id: 'new', title: 'New Lead' },
  { id: 'qualified', title: 'Qualified' },
  { id: 'contacted', title: 'Contacted' },
  { id: 'demo', title: 'Demo Booked' },
  { id: 'proposal', title: 'Proposal' },
  { id: 'won', title: 'Won/Lost' }
]

// Data Dummy Leads
const leads = ref([
  { id: 1, columnId: 'new', tier: 'Tier A', name: 'Anton Sutarno', company: 'Haliburton', value: 12000, owner: 'AC' },
  { id: 2, columnId: 'new', tier: 'Tier C', name: 'Sarah', company: 'Meridian Logistics', value: 26000, owner: 'JM' },
  { id: 3, columnId: 'qualified', tier: 'Tier B', name: 'Chloe Bennett', company: 'Harbour Energy', value: 28500, owner: 'AC' },
  { id: 4, columnId: 'contacted', tier: 'Tier B', name: 'Budi Sitanggang', company: 'Nusantara Pay', value: 34000, owner: 'AC' },
  { id: 5, columnId: 'contacted', tier: 'Tier A', name: 'Sarah Whitfield', company: 'Garuda Freight', value: 60000, owner: 'JM' },
  { id: 6, columnId: 'demo', tier: 'Tier A', name: 'Rizky Hidayat', company: 'PT Timah Tbk', value: 50000, owner: 'JM' },
  { id: 7, columnId: 'demo', tier: 'Tier B', name: 'Liam Foster', company: 'Brisbane AI', value: 42000, owner: 'AC' },
  { id: 8, columnId: 'proposal', tier: 'Tier A', name: 'Daniel Santos', company: 'Kowhai Health', value: 60000, owner: 'JM' },
  { id: 9, columnId: 'proposal', tier: 'Tier A', name: 'Mei Tanaka', company: 'Lumen Analytics', value: 56500, owner: 'AC' },
  { id: 10, columnId: 'won', tier: 'Tier A', name: 'Tama Ngata', company: 'Aotearoa Cloud', value: 110000, owner: 'JM' },
  { id: 11, columnId: 'won', tier: 'Tier C', name: 'Siti Rahmawati', company: 'Bandung Textiles', value: 18000, owner: 'AC' },
])

// ==========================================
// LOGIKA DRAG AND DROP (BARU)
// ==========================================
const draggedLeadId = ref<number | null>(null)

// Saat kartu mulai ditarik
const onDragStart = (event: DragEvent, leadId: number) => {
  draggedLeadId.value = leadId
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    // Hack kecil Firefox
    event.dataTransfer.setData('text/plain', leadId.toString())
  }
}

// Saat kartu dilepas di kolom baru
const onDrop = (columnId: string) => {
  if (draggedLeadId.value !== null) {
    const targetLead = leads.value.find(l => l.id === draggedLeadId.value)
    if (targetLead) {
      targetLead.columnId = columnId
    }
    // Kosongkan kembali state dragging
    draggedLeadId.value = null
  }
}


// ==========================================
// FUNGSI LOGIKA KANBAN & FILTER
// ==========================================
const getLeadsByColumn = (columnId: string) => {
  return leads.value.filter(lead => {
    const matchColumn = lead.columnId === columnId
    const matchTier = selectedTier.value === '' || lead.tier === selectedTier.value
    const matchOwner = selectedOwner.value === '' || lead.owner === selectedOwner.value
    const matchSearch = searchQuery.value === '' || 
      lead.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      lead.company.toLowerCase().includes(searchQuery.value.toLowerCase())
      
    return matchColumn && matchTier && matchOwner && matchSearch
  })
}

const getColumnTotal = (columnId: string) => {
  const total = getLeadsByColumn(columnId).reduce((sum, lead) => sum + lead.value, 0)
  return formatCurrency(total)
}

const formatCurrency = (value: number) => {
  if (value >= 1000) {
    const formatted = (value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)
    return `$${formatted}K`
  }
  return `$${value}`
}

// ==========================================
// FUNGSI MODAL ADD LEAD
// ==========================================
const openAddLeadModal = () => {
  newLeadForm.value = { name: '', company: '', value: 0, tier: 'Tier A', owner: 'AC' }
  isAddLeadModalOpen.value = true
}
const closeAddLeadModal = () => isAddLeadModalOpen.value = false

const submitNewLead = () => {
  if (!newLeadForm.value.name || !newLeadForm.value.company || newLeadForm.value.value <= 0) return

  leads.value.push({
    id: Date.now(),
    columnId: 'new',
    name: newLeadForm.value.name,
    company: newLeadForm.value.company,
    value: newLeadForm.value.value,
    tier: newLeadForm.value.tier,
    owner: newLeadForm.value.owner
  })
  closeAddLeadModal()
}
</script>

<template>
  <MainLayout active-menu="pipeline">
    <main class="flex-1 p-8 flex flex-col h-full overflow-hidden">
      
      <div class="mb-6">
        <h1 class="text-[32px] font-bold text-[#0F172A] tracking-tight">Sales Pipeline</h1>
        <p class="text-[14px] text-[#64748B] mt-0.5">Track and manage leads as they move through every stage.</p>
      </div>

      <div class="flex-1 bg-white border border-[#E2E8F0] rounded-xl flex flex-col overflow-hidden shadow-sm">
        
        <!-- Filter Bar -->
        <div class="h-14 border-b border-[#E2E8F0] flex items-center justify-between px-4 flex-shrink-0 bg-white">
          <div class="relative w-64">
            <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input v-model="searchQuery" type="text" placeholder="Search pipeline..." class="w-full pl-9 pr-3 py-1.5 text-[13px] border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2563EB]"/>
          </div>

          <div class="flex items-center gap-3">
            <select v-model="selectedTier" class="text-[13px] text-[#0F172A] border border-gray-300 rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:border-[#2563EB] cursor-pointer hover:bg-gray-50 bg-white appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:1em_1em]" style="background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E');">
              <option value="">All Tiers</option>
              <option value="Tier A">Tier A</option>
              <option value="Tier B">Tier B</option>
              <option value="Tier C">Tier C</option>
            </select>

            <select v-model="selectedOwner" class="text-[13px] text-[#0F172A] border border-gray-300 rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:border-[#2563EB] cursor-pointer hover:bg-gray-50 bg-white appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:1em_1em]" style="background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E');">
              <option value="">All Owners</option>
              <option value="AC">AC</option>
              <option value="JM">JM</option>
            </select>

            <button @click="openAddLeadModal" class="flex items-center gap-1.5 bg-[#2563EB] text-white text-[13px] font-medium py-1.5 px-4 rounded-md hover:bg-blue-700 transition shadow-sm">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add lead
            </button>
          </div>
        </div>

        <!-- Columns Container -->
        <div class="flex-1 overflow-x-auto overflow-y-hidden p-4 flex gap-4 bg-[#F8FAFC]">
          
          <!-- AREA DROP ZONE (Menangkap Drag Over dan Drop) -->
          <div 
            v-for="column in pipelineColumns" 
            :key="column.id" 
            class="w-[320px] min-w-[320px] flex flex-col h-full rounded-xl transition-colors"
            @dragover.prevent
            @dragenter.prevent
            @drop="onDrop(column.id)"
          >
            <!-- Column Header -->
            <div class="mb-4">
              <div class="flex items-center justify-between mb-1">
                <h2 class="text-[17px] font-bold text-[#0F172A]">{{ column.title }}</h2>
                <span class="text-xs font-bold text-[#64748B] bg-white border border-[#E2E8F0] w-6 h-6 rounded-full flex items-center justify-center">
                  {{ getLeadsByColumn(column.id).length }}
                </span>
              </div>
              <p class="text-[12px] font-semibold text-[#94A3B8]">{{ getColumnTotal(column.id) }} total</p>
              <div class="w-full h-px bg-gray-200 mt-2"></div>
            </div>

            <!-- Empty State -->
            <div v-if="getLeadsByColumn(column.id).length === 0" class="flex-1 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center pointer-events-none">
              <span class="text-xs text-gray-400 font-medium">Drop lead here...</span>
            </div>

            <!-- Cards List -->
            <div v-else class="flex-1 overflow-y-auto space-y-3 pb-4 pr-1">
              
              <!-- CARD (Menjadi objek yang bisa di-drag) -->
              <div 
                v-for="lead in getLeadsByColumn(column.id)" 
                :key="lead.id" 
                draggable="true"
                @dragstart="onDragStart($event, lead.id)"
                class="bg-white border border-[#E2E8F0] border-l-4 rounded-lg p-3.5 shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing"
                :class="{
                  'border-l-blue-600': lead.tier === 'Tier A',
                  'border-l-amber-400': lead.tier === 'Tier B',
                  'border-l-slate-300': lead.tier === 'Tier C'
                }"
              >
                <!-- Header: Company & Tier -->
                <div class="flex items-start justify-between gap-2 mb-0.5 pointer-events-none">
                  <h3 class="text-[13px] font-bold text-[#0F172A] leading-snug">{{ lead.company }}</h3>
                  <span class="text-[10px] font-semibold text-[#64748B] tracking-tight">{{ lead.tier }}</span>
                </div>

                <!-- Subtitle: Contact Person -->
                <p class="text-[11px] text-[#64748B] mb-3 pointer-events-none">{{ lead.name }}</p>

                <!-- Footer: Value & Owner -->
                <div class="flex items-center justify-between pt-2 border-t border-slate-100 pointer-events-none">
                  <span class="text-[13px] font-bold text-[#0F172A]">{{ formatCurrency(lead.value) }}</span>
                  <div class="w-5 h-5 rounded-full bg-[#E0E7FF] text-[#2563EB] border border-[#C7D2FE] text-[9px] font-bold flex items-center justify-center">
                    {{ lead.owner }}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  </MainLayout>

  <!-- MODAL: ADD LEAD -->
  <div v-if="isAddLeadModalOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <div class="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-sm transition-opacity" @click="closeAddLeadModal"></div>
    <div class="relative bg-white shadow-2xl w-full max-w-[450px] p-8 rounded-xl">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-[#0F172A]">Add New Lead</h2>
        <button @click="closeAddLeadModal" class="text-gray-400 hover:text-gray-600 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <form @submit.prevent="submitNewLead" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-[#475569] mb-1">Contact Name</label>
          <input v-model="newLeadForm.name" type="text" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB]" placeholder="e.g. John Doe">
        </div>
        
        <div>
          <label class="block text-xs font-semibold text-[#475569] mb-1">Company</label>
          <input v-model="newLeadForm.company" type="text" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB]" placeholder="e.g. Tech Corp">
        </div>

        <div>
          <label class="block text-xs font-semibold text-[#475569] mb-1">Deal Value ($)</label>
          <input v-model="newLeadForm.value" type="number" min="1" required class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB]" placeholder="e.g. 50000">
        </div>

        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-xs font-semibold text-[#475569] mb-1">Tier</label>
            <select v-model="newLeadForm.tier" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB]">
              <option value="Tier A">Tier A</option>
              <option value="Tier B">Tier B</option>
              <option value="Tier C">Tier C</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-xs font-semibold text-[#475569] mb-1">Owner</label>
            <select v-model="newLeadForm.owner" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB]">
              <option value="AC">AC</option>
              <option value="JM">JM</option>
            </select>
          </div>
        </div>

        <div class="pt-4 flex gap-3">
          <button type="button" @click="closeAddLeadModal" class="flex-1 py-2 border border-gray-300 bg-white text-[#0F172A] text-sm font-bold rounded-md hover:bg-gray-50 transition">Cancel</button>
          <button type="submit" class="flex-1 py-2 bg-[#2563EB] text-white text-sm font-bold rounded-md hover:bg-blue-700 transition">Save Lead</button>
        </div>
      </form>
    </div>
  </div>
</template>