<script setup lang="ts">
import { ref } from 'vue'
import MainLayout from '../components/MainLayout.vue'

// Data Form Settings
const profileForm = ref({
  fullName: 'Jordan Miles',
  workEmail: 'jordan.miles@atlas.ai',
  jobTitle: 'Sales Ops'
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: ''
})

// Fungsi Submit Form
const saveProfile = () => {
  console.log('Profile saved:', profileForm.value)
}
const updatePassword = () => {
  console.log('Password updated:', passwordForm.value)
}
</script>

<template>
  <!-- Menggunakan MainLayout dan menetapkan menu "settings" sebagai menu aktif -->
  <MainLayout active-menu="settings">
    
    <!-- KONTEN HALAMAN SETTINGS -->
    <main class="flex-1 p-8 flex flex-col h-full overflow-y-auto">
      
      <!-- Page Title -->
      <div class="mb-8">
        <h1 class="text-[28px] font-bold text-[#0F172A] tracking-tight">Settings</h1>
        <p class="text-[15px] text-[#64748B] mt-1">Manage your account preferences and workspace configuration.</p>
      </div>

      <!-- Layout Grid untuk Menu Inner & Konten Utama -->
      <div class="flex flex-col lg:flex-row gap-6 max-w-6xl">
        
        <!-- Inner Sidebar Navigation -->
        <div class="w-full lg:w-72 bg-white border border-[#E2E8F0] rounded-xl p-3 h-fit shadow-sm flex-shrink-0">
          <nav class="space-y-1">
            <!-- Active Nav Item -->
            <a href="#" class="flex items-center gap-3 px-4 py-2.5 bg-[#EBF3FF] text-[#2563EB] rounded-lg font-medium text-[14.5px] transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              My Profile
            </a>
            <!-- Inactive Nav Items -->
            <a href="#" class="flex items-center gap-3 px-4 py-2.5 text-[#64748B] hover:bg-gray-50 rounded-lg font-medium text-[14.5px] transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Team Management
            </a>
            <a href="#" class="flex items-center gap-3 px-4 py-2.5 text-[#64748B] hover:bg-gray-50 rounded-lg font-medium text-[14.5px] transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              AI Scoring Rules
            </a>
            <a href="#" class="flex items-center gap-3 px-4 py-2.5 text-[#64748B] hover:bg-gray-50 rounded-lg font-medium text-[14.5px] transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Email Integrations
            </a>
          </nav>
        </div>

        <!-- Main Configuration Area -->
        <div class="flex-1 bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-sm">
          
          <!-- Section 1: Profile Settings -->
          <section>
            <h2 class="text-[19px] font-bold text-[#0F172A] mb-1">Profile Settings</h2>
            <p class="text-[14px] text-[#64748B] mb-8">Update your personal information and how others see you on Atlas.</p>
            
            <!-- Avatar Area -->
            <div class="flex items-center gap-5 mb-8">
              <div class="w-20 h-20 rounded-full bg-[#EBF3FF] text-[#2563EB] font-bold text-2xl flex items-center justify-center">JM</div>
              <div>
                <button class="px-4 py-2 bg-white border border-[#E2E8F0] rounded-md text-[13px] font-semibold text-[#0F172A] hover:bg-gray-50 transition shadow-sm mb-2">Change Photo</button>
                <p class="text-[12px] text-[#94A3B8]">JPG, PNG or GIF. Max 2MB.</p>
              </div>
            </div>

            <!-- Form Fields -->
            <form @submit.prevent="saveProfile" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label class="block text-[13px] font-semibold text-[#0F172A] mb-2">Full Name</label>
                <input v-model="profileForm.fullName" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#2563EB]">
              </div>
              <div>
                <label class="block text-[13px] font-semibold text-[#0F172A] mb-2">Work Email</label>
                <input v-model="profileForm.workEmail" type="email" class="w-full border border-gray-300 rounded-md px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#2563EB]">
              </div>
              <div>
                <label class="block text-[13px] font-semibold text-[#0F172A] mb-2">Job Title</label>
                <input v-model="profileForm.jobTitle" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#2563EB]">
              </div>
            </form>

            <button @click="saveProfile" class="bg-[#2563EB] text-white text-[14px] font-semibold py-2 px-6 rounded-md hover:bg-blue-700 transition shadow-sm">Save Changes</button>
          </section>

          <!-- Divider -->
          <hr class="border-[#E2E8F0] my-10" />

          <!-- Section 2: Security -->
          <section>
            <h2 class="text-[19px] font-bold text-[#0F172A] mb-1">Security</h2>
            <p class="text-[14px] text-[#64748B] mb-8">Keep your account secure by updating your password regularly.</p>
            
            <form @submit.prevent="updatePassword" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label class="block text-[13px] font-semibold text-[#0F172A] mb-2">Current Password</label>
                <input v-model="passwordForm.currentPassword" type="password" class="w-full border border-gray-300 rounded-md px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#2563EB]">
              </div>
              <div>
                <label class="block text-[13px] font-semibold text-[#0F172A] mb-2">New Password</label>
                <input v-model="passwordForm.newPassword" type="password" class="w-full border border-gray-300 rounded-md px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#2563EB]">
              </div>
            </form>

            <button @click="updatePassword" class="bg-[#2563EB] text-white text-[14px] font-semibold py-2 px-6 rounded-md hover:bg-blue-700 transition shadow-sm">Update Password</button>
          </section>

        </div>
      </div>
    </main>
  </MainLayout>
</template>