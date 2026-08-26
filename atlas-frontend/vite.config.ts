import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  
  // ==========================================
  // TAMBAHAN KONFIGURASI BUILD
  // ==========================================
  build: {
    chunkSizeWarningLimit: 2000, // Menaikkan batas peringatan ukuran file ke 2 MB
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Memisahkan semua library eksternal (node_modules) menjadi file 'vendor' tersendiri
          // Ini sangat bagus untuk performa saat aplikasi dibuka pertama kali
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})