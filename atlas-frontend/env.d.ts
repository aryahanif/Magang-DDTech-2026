/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue3-lottie' {
  import type { DefineComponent } from 'vue'
  export const Vue3Lottie: DefineComponent<{}, {}, any>
}

declare module '@lucide/vue';