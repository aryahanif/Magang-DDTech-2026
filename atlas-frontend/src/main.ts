import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { polyfill } from "mobile-drag-drop";
import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";
import "mobile-drag-drop/default.css";

polyfill({
    dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride
});

window.addEventListener('touchmove', function() {}, {passive: false});

const app = createApp(App)

app.use(router)

app.mount('#app')
