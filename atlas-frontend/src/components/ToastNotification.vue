<script setup lang="ts">
import { useToast } from '../composables/UseToast'

const { toasts, removeToast } = useToast()
</script>

<template>
  <div class="fixed top-20 right-4 sm:right-6 z-[100] flex flex-col gap-3 pointer-events-none">
    
    <TransitionGroup name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="pointer-events-auto flex items-start gap-3 p-4 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-[#E2E8F0] w-[320px] max-w-[calc(100vw-32px)]"
      >
        <div class="mt-0.5 flex-shrink-0">
          <svg v-if="toast.type === 'success'" class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <svg v-else-if="toast.type === 'error'" class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <svg v-else class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-[13px] font-bold text-[#0F172A] mb-0.5">
            {{ toast.type === 'success' ? 'Berhasil' : toast.type === 'error' ? 'Gagal' : 'Informasi' }}
          </p>
          <p class="text-[12px] text-[#64748B] leading-snug">{{ toast.message }}</p>
        </div>

        <button @click="removeToast(toast.id)" class="text-gray-400 hover:text-gray-700 transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </TransitionGroup>

  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
</style>