<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Sun, Moon } from '@lucide/vue'
import AtlasLogo from '../assets/atlas-logo.png'
import api from '../services/api'

const router = useRouter()
const route = useRoute()

const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const isDarkMode = ref(false)
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

onMounted(() => {
  if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})

const handleReset = async () => {
  // Token is usually in URL query (e.g., ?token=xyz&email=abc)
  const token = route.query.token as string
  const email = route.query.email as string
  
  if (!token || !email) {
    errorMessage.value = 'Invalid or missing reset token.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }
  
  if (newPassword.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters long.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await api.post('/api/auth/reset-password', {
      email,
      token,
      new_password: newPassword.value
    })
    
    if (response.data && response.data.success) {
      successMessage.value = response.data.message || 'Password successfully reset! You can now log in.'
      newPassword.value = ''
      confirmPassword.value = ''
    } else {
      errorMessage.value = 'Failed to reset password. Please try again.'
    }
  } catch (error: any) {
    console.error('Reset password failed:', error)
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = 'An error occurred while resetting password. The link might be expired.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex h-screen w-full bg-slate-50 dark:bg-[#0B1120] text-gray-800 dark:text-gray-200 font-sans relative overflow-hidden transition-colors items-center justify-center">
    
    <!-- Living AI Orbs (Atlas Identity) -->
    <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-orb-1"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-orb-2"></div>
    <div class="absolute top-[30%] left-[30%] w-[40%] h-[40%] bg-sky-400/10 blur-[100px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-orb-3"></div>

    <div class="w-full max-w-md p-8 sm:p-10 relative overflow-hidden bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] m-4 transition-colors z-10">
      <!-- Logo -->
      <div class="flex items-center justify-center gap-2.5 font-bold text-2xl text-gray-900 dark:text-white mb-8 transition-colors">
        <img :src="AtlasLogo" alt="Atlas Logo" class="h-8 w-auto" />
        Atlas
      </div>

      <!-- Theme Toggle -->
      <button @click="toggleTheme" class="absolute top-6 right-6 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2 rounded-full transition-colors z-10 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <Sun v-if="isDarkMode" class="w-5 h-5" />
        <Moon v-else class="w-5 h-5" />
      </button>
      
      <div class="w-full space-y-6">
        
        <!-- Header Form -->
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white transition-colors mb-2">Create New Password</h2>
          <p class="text-[13px] text-gray-500 dark:text-slate-400 transition-colors">Please enter your new password below.</p>
        </div>

        <!-- Form Input -->
        <form @submit.prevent="handleReset" class="space-y-4 mt-6">
          
          <div v-if="errorMessage" class="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[13px] p-3 rounded-lg border border-red-200 dark:border-red-800/50 transition-colors">
            {{ errorMessage }}
          </div>
          
          <div v-if="successMessage" class="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[13px] p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/50 transition-colors text-center">
            {{ successMessage }}
            <br/>
            <router-link to="/admin" class="font-bold underline mt-2 inline-block hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">Back to Login</router-link>
          </div>

          <!-- New Password -->
          <div>
            <label class="block text-[13px] font-semibold text-gray-900 dark:text-white mb-1.5 transition-colors">New Password</label>
            <div class="relative">
              <input 
                v-model="newPassword" 
                :type="showPassword ? 'text' : 'password'" 
                required
                placeholder="............" 
                class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg text-[13px] focus:ring-2 focus:ring-[#1a4bca] outline-none transition-all"
              />
              <button 
                type="button" 
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path v-if="!showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path v-if="!showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-[13px] font-semibold text-gray-900 dark:text-white mb-1.5 transition-colors">Confirm Password</label>
            <div class="relative">
              <input 
                v-model="confirmPassword" 
                :type="showPassword ? 'text' : 'password'" 
                required
                placeholder="............" 
                class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg text-[13px] focus:ring-2 focus:ring-[#1a4bca] outline-none transition-all"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full flex justify-center py-2.5 px-4 mt-4 border border-transparent rounded-lg shadow-sm text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading">Resetting...</span>
            <span v-else>Reset Password</span>
          </button>
        </form>
        
        <p v-if="!successMessage" class="text-center text-[12px] text-gray-500 dark:text-slate-400 mt-6 transition-colors">
          <router-link to="/admin" class="font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">Return to Login</router-link>
        </p>

      </div>
    </div>
    
  </div>
</template>
