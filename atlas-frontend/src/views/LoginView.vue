
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// State management untuk form
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')
const router = useRouter()

import api from '../services/api'

const handleLogin = async () => {
  try {
    errorMessage.value = ''
    const response = await api.post('/api/auth/login', {
      email: email.value,
      password: password.value
    })

    if (response.data && response.data.success) {
      // Simpan token dan data user ke localStorage
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      router.push('/admin/dashboard')
    }
  } catch (error: any) {
    console.error('Login failed:', error)
    if (error.response && error.response.status === 401) {
      errorMessage.value = 'Email atau password salah.'
    } else {
      errorMessage.value = 'Terjadi kesalahan pada server. Coba lagi nanti.'
    }
  }
}
</script>

<template>
  <div class="flex h-screen w-full bg-white text-gray-800 font-sans">
    
    <!-- SISI KIRI (Biru) -->
    <div class="hidden lg:flex w-1/2 bg-gradient-to-br from-[#2563EB] to-[#0030AA] text-white flex-col relative p-12">
      <!-- Logo -->
      <div class="absolute top-12 left-12 flex items-center gap-3 font-bold text-2xl">
        <div class="bg-white text-[#1a4bca] w-8 h-8 flex items-center justify-center rounded pt-0.5">
          A
        </div>
        Atlas
      </div>
      
      <!-- Copywriting -->
      <div class="max-w-xl my-auto">
        <h1 class="text-[48px] font-bold mb-6 animate-fade-in-up ">
          AI Powered Workforce,<br/>human-quality Leads.
        </h1>
        <p class="text-blue-100 text-[16px] leading-relaxed">
          Manage, Qualify, and convert your B2B pipeline with Atlas<br/>
          the modern CRM build for AI workforce teams.
        </p>
      </div>
    </div>

    <!-- SISI KANAN (Form) -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
      <div class="w-full max-w-md space-y-8">
        
        <!-- Header Form -->
        <div>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Sign in to your account</h2>
          <p class="text-gray-500">Enter your credentials to access the dashboard.</p>
        </div>

        <!-- Form Input -->
        <form @submit.prevent="handleLogin" class="space-y-6 mt-8">
          
          <div v-if="errorMessage" class="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
            {{ errorMessage }}
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Email address</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input 
                v-model="email" 
                type="email" 
                required
                placeholder="email" 
                class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4bca] focus:border-[#1a4bca] outline-none transition-all"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Password</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                required
                placeholder="............" 
                class="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4bca] focus:border-[#1a4bca] outline-none transition-all"
              />
              <button 
                type="button" 
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path v-if="!showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path v-if="!showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Options -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input v-model="rememberMe" id="remember-me" type="checkbox" class="h-4 w-4 text-[#1a4bca] focus:ring-[#1a4bca] border-gray-300 rounded cursor-pointer">
              <label for="remember-me" class="ml-2 block text-sm text-gray-600 cursor-pointer">
                Remember me
              </label>
            </div>
            <div class="text-sm">
              <a href="#" class="font-semibold text-[#1a4bca] hover:text-blue-800">
                Forgot password?
              </a>
            </div>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2250c6] hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            Sign in
          </button>
        </form>

        <p class="text-center text-sm text-gray-600 mt-6">
          Don't have an account? <a href="#" class="font-semibold text-[#1a4bca] hover:text-blue-800">Contact Sales</a>
        </p>
      </div>
    </div>
    
  </div>
</template>
<style scoped>
/* Membuat frame animasi dari bawah (transparan) ke atas (jelas) */
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(50px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Menerapkan animasi dengan durasi 1 detik dan transisi yang halus */
.animate-fade-in-up {
  opacity: 0; /* Mulai dari transparan sebelum animasi berjalan */
  animation: fadeInUp 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>