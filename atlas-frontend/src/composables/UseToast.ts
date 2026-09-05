import { ref } from 'vue'

// Mendefinisikan struktur data Toast
export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

// State Global (ditaruh di luar fungsi agar datanya persisten antar komponen)
const toasts = ref<Toast[]>([])
let nextId = 0

export function useToast() {
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = nextId++
    toasts.value.push({ id, message, type })
    
    // Otomatis hilang setelah 3.5 detik
    setTimeout(() => {
      removeToast(id)
    }, 3500)
  }

  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, showToast, removeToast }
}