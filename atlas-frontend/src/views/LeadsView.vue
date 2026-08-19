<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits(['navigate'])

// Cetak Biru Data (Interface)
interface Lead {
  id: number;
  name: string;
  role: string;
  company: string;
  country: string;
  source: string;
  tier: string;
  status: string;
  score: string;
  updated: string;
}

// Data Summary
// Data Summary
const summaryCards = [
  { 
    title: 'Total Leads', 
    value: '12', 
    description: 'All active records',
    // Paste kode SVG dari Iconify di dalam tanda kutip terbalik (backtick `...`)
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
  },
  { 
    title: 'Tier A Leads', 
    value: '6', 
    description: 'High-fit accounts',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>` // Contoh icon star
  },
  { 
    title: 'Demo Request', 
    value: '2', 
    description: 'Scheduled this week',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>` // Contoh icon calendar
  },
  { 
    title: 'Open Pipeline Value', 
    value: '$367.5K', 
    description: 'Excludes won & lost',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>` // Contoh icon dollar
  }
]

// Data Asli (Sumber Kebenaran)
const leadsData = ref<Lead[]>([
  { id: 1, name: 'Sarah', role: 'Head of Ops', company: 'Meridian Logistics', country: 'Australia', source: 'Website', tier: 'Tier A', status: 'Demo', score: 'Value', updated: '2h ago' },
  { id: 2, name: 'Anton', role: 'COO', company: 'Kowhai Health', country: 'New Zealand', source: 'Referral', tier: 'Tier B', status: 'Proposal', score: '60k', updated: '4h ago' },
  { id: 3, name: 'Budi', role: 'VP Customer', company: 'Nusantara Pay', country: 'Indonesia', source: 'LinkedIn', tier: 'Tier B', status: 'Qualified', score: '60k', updated: '6h ago' },
  { id: 4, name: 'Michael', role: 'Director of CX', company: 'Southbank Retail', country: 'New Zealand', source: 'Outbound', tier: 'Tier A', status: 'Contacted', score: '34k', updated: 'Yesterday' },
  { id: 5, name: 'Kevin', role: 'Founder', company: 'Tuia Studio', country: 'New Zealand', source: 'Website', tier: 'Tier C', status: 'New Lead', score: '21.5k', updated: '2d ago' },
  { id: 6, name: 'Amelia', role: 'Head Of Support', company: 'Garuda Flight', country: 'Indonesia', source: 'Partner', tier: 'Tier B', status: 'Demo', score: '12k', updated: 'Yesterday' },
  { id: 7, name: 'Putri', role: 'CTO', company: 'Haliburton', country: 'Indonesia', source: 'Event', tier: 'Tier A', status: 'Qualified', score: '50k', updated: '2d ago' },
  { id: 8, name: 'Siti', role: 'Supervisor', company: 'Bandung Textiles', country: 'Indonesia', source: 'LinkedIn', tier: 'Tier B', status: 'Won', score: '110k', updated: '3 days ago' },
  { id: 9, name: 'Chloe', role: 'COO', company: 'PT Astra', country: 'Indonesia', source: 'Outbound', tier: 'Tier C', status: 'Lost', score: '12k', updated: '4d ago' },
  { id: 10, name: 'Jason', role: 'GM Commercial', company: 'Perth Marine', country: 'Australia', source: 'Referral', tier: 'Tier A', status: 'Contacted', score: '17k', updated: '5d ago' },
])

// ==========================================
// LOGIKA FILTER & PENCARIAN
// ==========================================
const searchQuery = ref('')
const filterStatus = ref('')
const filterCountry = ref('')
const filterTier = ref('')

// Data yang ditampilkan di tabel (Hasil Saringan)
const filteredLeads = computed(() => {
  return leadsData.value.filter(lead => {
    // Cocokkan teks pencarian (berdasarkan Nama atau Perusahaan)
    const matchSearch = lead.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                        lead.company.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    // Cocokkan pilihan dropdown (Jika kosong/All, anggap true)
    const matchStatus = filterStatus.value ? lead.status === filterStatus.value : true
    const matchCountry = filterCountry.value ? lead.country === filterCountry.value : true
    const matchTier = filterTier.value ? lead.tier === filterTier.value : true

    // Kembalikan data HANYA jika lolos semua saringan
    return matchSearch && matchStatus && matchCountry && matchTier
  })
})

// ==========================================
// LOGIKA SELECT ALL & BULK ACTIONS
// ==========================================
const selectedLeads = ref<number[]>([])

// Centang 'Select All' HANYA berdasarkan data yang sedang tampil di saringan
const isAllSelected = computed(() => filteredLeads.value.length > 0 && selectedLeads.value.length === filteredLeads.value.length)

const toggleSelectAll = (event: Event) => {
  const isChecked = (event.target as HTMLInputElement).checked
  selectedLeads.value = isChecked ? filteredLeads.value.map(lead => lead.id) : []
}

const deleteSelectedLeads = () => {
  leadsData.value = leadsData.value.filter(lead => !selectedLeads.value.includes(lead.id))
  selectedLeads.value = [] 
}

// ==========================================
// LOGIKA CRUD TUNGGAL & MODAL FORM
// ==========================================
const isModalOpen = ref(false)
const editingId = ref<number | null>(null) 
const activeDropdownId = ref<number | null>(null) 

const newLead = ref({
  name: '', company: '', country: 'Australia', source: 'Website', tier: 'Tier A', status: 'Proposal', score: ''
})

const openAddModal = () => {
  editingId.value = null
  newLead.value = { name: '', company: '', country: 'Australia', source: 'Website', tier: 'Tier A', status: 'Proposal', score: '' }
  isModalOpen.value = true
}

const openEditModal = (lead: Lead) => {
  activeDropdownId.value = null
  editingId.value = lead.id
  newLead.value = { 
    name: lead.name, company: lead.company, country: lead.country, source: lead.source, tier: lead.tier, status: lead.status, score: lead.score 
  }
  isModalOpen.value = true
}

const deleteLead = (id: number) => {
  leadsData.value = leadsData.value.filter(lead => lead.id !== id)
  activeDropdownId.value = null
  selectedLeads.value = selectedLeads.value.filter(selectedId => selectedId !== id)
}

const submitForm = () => {
  if (editingId.value) {
    const index = leadsData.value.findIndex(l => l.id === editingId.value)
    if (index !== -1) {
      const oldData = leadsData.value[index]
      if (oldData) {
        leadsData.value.splice(index, 1, {
          id: oldData.id,               
          role: oldData.role,           
          name: newLead.value.name,
          company: newLead.value.company,
          country: newLead.value.country,
          source: newLead.value.source,
          tier: newLead.value.tier,
          status: newLead.value.status,
          score: newLead.value.score,
          updated: 'Just now'
        })
      }
    }
  } else {
    const newId = leadsData.value.length ? Math.max(...leadsData.value.map(l => l.id)) + 1 : 1
    leadsData.value.unshift({
      id: newId,
      name: newLead.value.name || 'Unknown', 
      role: '-', 
      company: newLead.value.company || '-', 
      country: newLead.value.country, 
      source: newLead.value.source, 
      tier: newLead.value.tier, 
      status: newLead.value.status, 
      score: newLead.value.score || '-', 
      updated: 'Just now'
    })
  }
  closeModal()
}

const closeModal = () => {
  isModalOpen.value = false
  editingId.value = null
}

const getTierClass = (tier: string) => {
  switch (tier) {
    case 'Tier A': return 'bg-[#2563EB] text-white'
    case 'Tier B': return 'bg-[#94A3B8] text-white'
    case 'Tier C': return 'bg-[#CBD5E1] text-[#475569]'
    default: return 'bg-gray-200 text-gray-700'
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Demo': case 'Proposal': return 'text-[#2563EB]'
    case 'Won': return 'text-[#16A34A]'
    case 'Lost': return 'text-[#DC2626]'
    default: return 'text-[#0F172A]'
  }
}
</script>

<template>
  <div class="flex min-h-screen bg-[#F8FAFC] font-sans text-[#1E293B]">
    
    <div v-if="activeDropdownId" @click="activeDropdownId = null" class="fixed inset-0 z-10"></div>

    <!-- SIDEBAR -->
    <aside class="w-64 bg-white border-r border-[#E2E8F0] flex flex-col justify-between flex-shrink-0 z-20 relative">
      <div>
        <div class="h-16 flex items-center gap-3 px-6 border-b border-[#E2E8F0]">
          <div class="bg-[#2563EB] text-white font-bold text-xs px-2 py-1 rounded">Logo</div>
          <span class="font-bold text-xl text-[#0F172A]">Atlas</span>
        </div>
        <nav class="py-4 space-y-1.5">
          <a href="#" @click.prevent="emit('navigate', 'dashboard')" class="flex items-center gap-3 px-6 py-2.5 text-[#64748B] hover:bg-gray-50 font-medium text-sm transition border-l-4 border-transparent">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> Dashboard
          </a>
          <a href="#" class="flex items-center gap-3 px-6 py-2.5 bg-[#EFF6FF] text-[#2563EB] font-semibold text-sm border-l-4 border-[#2563EB]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> Leads
          </a>
          <a href="#" class="flex items-center gap-3 px-6 py-2.5 text-[#64748B] hover:bg-gray-50 font-medium text-sm transition border-l-4 border-transparent">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> Pipeline
          </a>
          <a href="#" class="flex items-center gap-3 px-6 py-2.5 text-[#64748B] hover:bg-gray-50 font-medium text-sm transition border-l-4 border-transparent">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Settings
          </a>
        </nav>
      </div>
      <div class="p-4 border-t border-[#E2E8F0]">
        <button @click="emit('navigate', 'login')" class="w-full text-left text-xs text-[#94A3B8] hover:text-[#EF4444] transition py-1 px-2">← Log out</button>
      </div>
    </aside>

    <!-- MAIN CONTENT AREA -->
    <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
      
      <!-- TOP HEADER -->
      <header class="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-8 flex-shrink-0 z-10">
        <div class="relative w-80">
          <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Search leads, companies..." class="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-full focus:outline-none focus:ring-1 focus:ring-[#2563EB]"/>
        </div>
        <div class="flex items-center gap-5">
          <button class="relative text-[#64748B] hover:text-[#0F172A]">
            <svg class="w-5 h-5 text-[#2563EB]" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
          </button>
          <div class="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div class="text-right">
              <div class="text-xs font-bold text-[#0F172A]">Aldean Tegar</div>
              <div class="text-[10px] text-[#64748B]">Admin</div>
            </div>
            <div class="w-8 h-8 rounded-full bg-[#E0E7FF] text-[#2563EB] font-bold text-xs flex items-center justify-center border border-[#C7D2FE]">AT</div>
          </div>
        </div>
      </header>

      <!-- PAGE BODY -->
      <main class="flex-1 p-8 overflow-y-auto">
        <div class="mb-8">
          <h1 class="text-[28px] font-bold text-[#0F172A] tracking-tight">Leads Management</h1>
          <p class="text-[13px] text-[#64748B] mt-1">All inbound and outbound leads captured by your AI workforce.</p>
        </div>

       <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div v-for="(card, index) in summaryCards" :key="index" class="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col justify-between h-28">
            
            <!-- Menggunakan flex justify-between agar text dan icon terpisah ke ujung -->
            <div class="flex items-start justify-between">
              <span class="text-[13px] font-medium text-[#64748B]">{{ card.title }}</span>
              <!-- Render string SVG menjadi elemen nyata dengan v-html -->
              <div v-html="card.icon"></div>
            </div>

            <div>
              <div class="text-[26px] font-bold text-[#0F172A] leading-none mb-1.5">{{ card.value }}</div>
              <p class="text-[11px] text-[#94A3B8] font-medium">{{ card.description }}</p>
            </div>
            
          </div>
        </div>

        <!-- Table Container -->
        <div class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col relative z-20">
          
          <!-- TOOLBAR DINAMIS & BINDING FILTER -->
          <div v-if="selectedLeads.length === 0" class="p-4 border-b border-[#E2E8F0] flex items-center justify-between gap-4 flex-wrap">
            <div class="relative w-64">
              <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <!-- Pencarian terhubung ke searchQuery -->
              <input v-model="searchQuery" type="text" placeholder="Search leads, companies..." class="w-full pl-9 pr-3 py-1.5 text-[13px] bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"/>
            </div>
            
            <div class="flex items-center gap-3">
              <!-- Filter terhubung ke variabel status, country, dan tier -->
              <select v-model="filterStatus" class="text-[13px] border border-[#E2E8F0] rounded-lg px-3 py-1.5 bg-white focus:outline-none cursor-pointer font-medium">
                <option value="">All status</option>
                <option value="New Lead">New Lead</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Demo">Demo</option>
                <option value="Proposal">Proposal</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
              
              <select v-model="filterCountry" class="text-[13px] border border-[#E2E8F0] rounded-lg px-3 py-1.5 bg-white focus:outline-none cursor-pointer font-medium">
                <option value="">All countries</option>
                <option value="Australia">Australia</option>
                <option value="Indonesia">Indonesia</option>
                <option value="New Zealand">New Zealand</option>
              </select>
              
              <select v-model="filterTier" class="text-[13px] border border-[#E2E8F0] rounded-lg px-3 py-1.5 bg-white focus:outline-none cursor-pointer font-medium">
                <option value="">All Tiers</option>
                <option value="Tier A">Tier A</option>
                <option value="Tier B">Tier B</option>
                <option value="Tier C">Tier C</option>
              </select>
              
              <button @click="openAddModal" class="text-[13px] rounded-lg px-4 py-1.5 bg-[#2563EB] text-white font-medium flex items-center gap-1 hover:bg-blue-700 transition shadow-sm">
                Add lead +
              </button>
            </div>
          </div>
          
          <div v-else class="p-4 border-b border-[#E2E8F0] bg-[#EFF6FF] flex items-center justify-between gap-4 flex-wrap transition-colors">
            <div class="flex items-center gap-3">
              <span class="text-[13px] font-bold text-[#2563EB] bg-white px-2.5 py-1 rounded-md shadow-sm border border-blue-100">
                {{ selectedLeads.length }} selected
              </span>
              <span class="text-[13px] text-[#2563EB] font-medium">Choose an action for the selected records.</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="selectedLeads = []" class="text-[13px] font-bold text-[#64748B] hover:text-[#0F172A] transition">Cancel</button>
              <button @click="deleteSelectedLeads" class="text-[13px] rounded-lg px-4 py-1.5 bg-red-500 text-white font-medium flex items-center gap-1.5 hover:bg-red-600 transition shadow-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg> Delete Selected
              </button>
            </div>
          </div>

          <div class="overflow-x-auto min-h-[300px]">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-[#E2E8F0] bg-white">
                  <th class="py-3 px-4 w-12 text-center">
                    <input type="checkbox" class="rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer" :checked="isAllSelected" @change="toggleSelectAll"/>
                  </th>
                  <th class="py-3 px-2 text-[13px] font-bold text-[#0F172A]">Lead</th>
                  <th class="py-3 px-2 text-[13px] font-bold text-[#0F172A]">Company</th>
                  <th class="py-3 px-2 text-[13px] font-bold text-[#0F172A] text-center">Country</th>
                  <th class="py-3 px-2 text-[13px] font-bold text-[#0F172A] text-center">Source</th>
                  <th class="py-3 px-2 text-[13px] font-bold text-[#0F172A] text-center">Tier</th>
                  <th class="py-3 px-2 text-[13px] font-bold text-[#0F172A] text-center">Status</th>
                  <th class="py-3 px-2 text-[13px] font-bold text-[#0F172A] text-center">Score</th>
                  <th class="py-3 px-4 text-[13px] font-bold text-[#0F172A] text-right">Updated</th>
                  <th class="py-3 px-2 w-10"></th> 
                </tr>
              </thead>
              <tbody>
                <!-- Loop sekarang menggunakan filteredLeads, bukan leadsData -->
                <tr 
                  v-for="lead in filteredLeads" 
                  :key="lead.id" 
                  class="border-b border-gray-100 transition group"
                  :class="selectedLeads.includes(lead.id) ? 'bg-[#EFF6FF] hover:bg-[#E0E7FF]' : 'hover:bg-gray-50'"
                >
                  <td class="py-3 px-4 text-center">
                    <input type="checkbox" :value="lead.id" v-model="selectedLeads" class="rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB] transition cursor-pointer" :class="selectedLeads.includes(lead.id) ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'"/>
                  </td>
                  <td class="py-3 px-2">
                    <div class="text-[13px] font-medium text-[#0F172A]">{{ lead.name }}</div>
                    <div class="text-[10px] text-[#94A3B8]">{{ lead.role }}</div>
                  </td>
                  <td class="py-3 px-2"><div class="text-[13px] font-medium text-[#0F172A]">{{ lead.company }}</div></td>
                  <td class="py-3 px-2 text-center text-[12px] text-[#64748B]">{{ lead.country }}</td>
                  <td class="py-3 px-2 text-center text-[12px] text-[#64748B]">{{ lead.source }}</td>
                  <td class="py-3 px-2 text-center"><span class="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold" :class="getTierClass(lead.tier)">{{ lead.tier }}</span></td>
                  <td class="py-3 px-2 text-center"><span class="text-[12px] font-medium" :class="getStatusClass(lead.status)">{{ lead.status }}</span></td>
                  <td class="py-3 px-2 text-center text-[12px] text-[#0F172A] font-medium">{{ lead.score }}</td>
                  <td class="py-3 px-4 text-right text-[12px] text-[#94A3B8]">{{ lead.updated }}</td>
                  
                  <td class="py-3 px-2 text-center relative">
                    <button 
                      @click.stop="activeDropdownId = activeDropdownId === lead.id ? null : lead.id"
                      class="p-1 rounded text-gray-400 hover:text-gray-800 hover:bg-gray-200 transition"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    <div 
                      v-if="activeDropdownId === lead.id" 
                      class="absolute right-8 top-10 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-30 py-1 text-left overflow-hidden"
                    >
                      <button @click="openEditModal(lead)" class="w-full px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 text-left transition">Edit</button>
                      <button @click="deleteLead(lead.id)" class="w-full px-4 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 text-left transition">Delete</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div v-if="filteredLeads.length === 0" class="py-12 text-center">
              <p class="text-[14px] text-gray-500 font-medium">No leads match your search or filter criteria.</p>
            </div>
          </div>

          <div class="p-4 bg-white flex items-center justify-between border-t border-[#E2E8F0]">
            <div class="text-[14px] text-black font-medium">
              <!-- Indikator Angka Otomatis Berubah Sesuai Filter -->
              Showing {{ filteredLeads.length }} of {{ leadsData.length }} Leads
            </div>
            <div class="flex items-center gap-3">
              <button class="px-5 py-2 border border-gray-300 rounded-lg text-[13px] font-bold text-black hover:bg-gray-50 transition shadow-sm disabled:opacity-50" :disabled="filteredLeads.length === 0">Previous</button>
              <button class="px-7 py-2 bg-[#2563EB] text-white rounded-lg text-[13px] font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50" :disabled="filteredLeads.length === 0">Next</button>
            </div>
          </div>
        </div>

        <div class="text-center text-[12px] text-[#2563EB] pt-8 pb-4">
          © 2026 DDTech. All rights reserved.
        </div>
      </main>
    </div>

    <!-- ========================================== -->
    <!-- MODAL (CREATE & UPDATE) -->
    <!-- ========================================== -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div class="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm transition-opacity" @click="closeModal"></div>
      <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-[480px] p-8 overflow-y-auto max-h-[90vh]">
        <button @click="closeModal" class="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div class="mb-6">
          <h2 class="text-[26px] font-bold text-black tracking-tight leading-none mb-1">
            {{ editingId ? 'Edit lead' : 'Add new lead' }}
          </h2>
          <p class="text-[13px] text-black">
            {{ editingId ? 'Update the details for this lead record' : 'Enter the lead details below to create a new record' }}
          </p>
        </div>

        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label class="block text-[15px] font-bold text-black mb-1.5">Full Name</label>
            <input v-model="newLead.name" type="text" required placeholder="budi santoso" class="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"/>
          </div>
          <div>
            <label class="block text-[15px] font-bold text-black mb-1.5">Company</label>
            <input v-model="newLead.company" type="text" required placeholder="Atlas" class="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"/>
          </div>
          <div>
            <label class="block text-[15px] font-bold text-black mb-1.5">Country</label>
            <select v-model="newLead.country" class="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition cursor-pointer appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%23000%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.75rem_center] bg-[length:1.25em]">
              <option value="Australia">Australia</option>
              <option value="New Zealand">New Zealand</option>
              <option value="Indonesia">Indonesia</option>
            </select>
          </div>
          <div>
            <label class="block text-[15px] font-bold text-black mb-1.5">Source</label>
            <select v-model="newLead.source" class="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition cursor-pointer appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%23000%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.75rem_center] bg-[length:1.25em]">
              <option value="Website">Website</option>
              <option value="Outbound">Outbound</option>
              <option value="Referral">Referral</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Event">Event</option>
              <option value="Partner">Partner</option>
            </select>
          </div>
          <div>
            <label class="block text-[15px] font-bold text-black mb-1.5">Tier</label>
            <select v-model="newLead.tier" class="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition cursor-pointer appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%23000%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.75rem_center] bg-[length:1.25em]">
              <option value="Tier A">Tier A</option>
              <option value="Tier B">Tier B</option>
              <option value="Tier C">Tier C</option>
            </select>
          </div>
          <div>
            <label class="block text-[15px] font-bold text-black mb-1.5">Status</label>
            <select v-model="newLead.status" class="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition cursor-pointer appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%23000%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.75rem_center] bg-[length:1.25em]">
              <option value="New Lead">New Lead</option>
              <option value="Qualified">Qualified</option>
              <option value="Contacted">Contacted</option>
              <option value="Demo">Demo</option>
              <option value="Proposal">Proposal</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-[15px] font-bold text-black mb-1.5">Score</label>
            <input v-model="newLead.score" type="text" placeholder="10K" class="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"/>
          </div>
          
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" @click="closeModal" class="px-5 py-2 border border-gray-300 rounded-lg text-[14px] font-bold text-black hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-[#2563EB] text-white rounded-lg text-[14px] font-bold hover:bg-blue-700 transition">
              {{ editingId ? 'Save changes' : 'Add lead' }}
            </button>
          </div>
        </form>

      </div>
    </div>
    
  </div>
</template>