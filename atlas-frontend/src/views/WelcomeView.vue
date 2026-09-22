<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Rocket, FileSearch, Users, PhoneCall, Clock, ArrowRight, CheckCircle2, ShieldUser, Sun, Moon, Mail, MessageCircle, ChevronDown } from '@lucide/vue'
import AtlasLogo from '../assets/atlas-logo.png'

const isDarkMode = ref(localStorage.getItem('theme') === 'dark')
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

const activeFaq = ref<number | null>(null)
const toggleFaq = (index: number) => {
  activeFaq.value = activeFaq.value === index ? null : index
}

const faqs = [
  {
    question: "What exactly is an AI Workforce?",
    answer: "An AI workforce is a team of specialized autonomous agents designed to handle repetitive tasks in customer service, sales, and operations. They integrate seamlessly with your existing tools to work 24/7 without fatigue."
  },
  {
    question: "Is our company data secure with Atlas?",
    answer: "Absolutely. We employ enterprise-grade encryption, strict role-based access controls, and comply with international data protection standards. Your proprietary data is never used to train public AI models."
  },
  {
    question: "How long does implementation usually take?",
    answer: "Most of our clients see their first AI agents deployed and delivering value within 3 to 7 days, depending on the complexity of your custom workflows and data integrations."
  },
  {
    question: "Do I need technical skills to use this platform?",
    answer: "Not at all. Atlas is built with a no-code, intuitive interface. If you can use standard CRM software or send an email, you can easily manage and monitor your AI workforce."
  }
]
</script>

<template>
  <main class="min-h-screen bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300 relative overflow-hidden flex flex-col">
    <!-- Theme Toggle -->
    <button @click="toggleTheme" class="absolute top-6 right-6 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2 rounded-full transition-colors z-50 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50">
      <Sun v-if="isDarkMode" class="w-5 h-5" />
      <Moon v-else class="w-5 h-5" />
    </button>
    <!-- Living AI Orbs (Atlas Identity) -->
    <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-orb-1"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-orb-2"></div>
    <div class="absolute top-[30%] left-[30%] w-[40%] h-[40%] bg-sky-400/10 blur-[100px] rounded-full pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-orb-3"></div>

    <div class="flex flex-col items-center justify-center flex-1 px-6 sm:px-12 pt-32 pb-16 text-center relative z-10">
      
      <h1 class="text-5xl font-extrabold text-slate-900 dark:text-white sm:text-6xl lg:text-7xl mb-6 animate-fade-blur tracking-tight transition-colors">
        Welcome to <span class="text-blue-600 dark:text-blue-400">Atlas</span>
      </h1>
      <p class="mt-4 max-w-2xl text-lg leading-relaxed text-slate-500 dark:text-slate-400 sm:text-xl mb-12 animate-fade-blur delay-100 transition-colors">
        Empower your business with AI-driven insights. Streamline workflows, boost productivity, and unlock new possibilities with our autonomous workforce.
      </p>

      <!-- Advanced Card Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-blur delay-200 w-full max-w-5xl text-left">
        
        <!-- Get Assessment (Primary/Highlighted) - Spans 2 columns -->
        <router-link to="/assessment" class="group lg:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/60 dark:border-slate-700/80 hover:bg-blue-600 dark:hover:bg-blue-600 hover:border-blue-500 hover:shadow-[0_8px_30px_rgb(37,99,235,0.4)] transition-all duration-300 rounded-3xl p-8 flex flex-col md:flex-row items-start md:items-center gap-8 relative overflow-hidden hover:-translate-y-1">
          <!-- Decorative blur inside card -->
          <div class="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 group-hover:bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:scale-125 transition-all duration-700"></div>
          
          <div class="w-16 h-16 shrink-0 bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 group-hover:text-white transition-all shadow-sm group-hover:shadow-none relative z-10">
            <FileSearch class="w-8 h-8" />
          </div>
          
          <div class="flex-1 relative z-10">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 group-hover:bg-blue-500/50 group-hover:border-blue-400/50 group-hover:text-white transition-colors text-[11px] font-bold uppercase tracking-wider mb-3">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 group-hover:bg-white opacity-75 transition-colors"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-600 group-hover:bg-white transition-colors"></span>
              </span>
              Recommended Start
            </div>
            <h3 class="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-white transition-colors mb-2">Request AI Assessment</h3>
            <p class="text-[15px] text-slate-500 dark:text-slate-400 group-hover:text-blue-100 transition-colors leading-relaxed mb-5 max-w-2xl">
              Not sure where to begin? Let our experts analyze your current business processes and provide a personalized roadmap showing exactly where AI can save you time and increase revenue.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 text-sm text-slate-600 dark:text-slate-300 group-hover:text-blue-50 font-medium transition-colors">
              <div class="flex items-center gap-2"><CheckCircle2 class="w-4 h-4 text-blue-500 group-hover:text-blue-300 transition-colors"/> 100% Free Analysis</div>
              <div class="flex items-center gap-2"><CheckCircle2 class="w-4 h-4 text-blue-500 group-hover:text-blue-300 transition-colors"/> Custom ROI Report</div>
              <div class="flex items-center gap-2"><CheckCircle2 class="w-4 h-4 text-blue-500 group-hover:text-blue-300 transition-colors"/> 24h Turnaround</div>
            </div>
          </div>
          
          <div class="hidden md:flex shrink-0 items-center justify-center w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 text-slate-400 group-hover:border-transparent group-hover:bg-white group-hover:text-blue-600 group-hover:translate-x-2 transition-all relative z-10">
            <ArrowRight class="w-5 h-5" />
          </div>
        </router-link>

        <!-- Request Demo -->
        <router-link to="/requestdemo" class="group bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/60 dark:border-slate-700/80 hover:bg-blue-600 dark:hover:bg-blue-600 hover:border-blue-500 hover:shadow-[0_8px_30px_rgb(37,99,235,0.2)] transition-all duration-300 rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden hover:-translate-y-1">
          <div class="flex justify-between items-start mb-6">
            <div class="w-14 h-14 bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 group-hover:text-white transition-all shadow-sm group-hover:shadow-none">
              <Rocket class="w-7 h-7" />
            </div>
            <div class="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:border-transparent group-hover:bg-white/10 transition-all">
              <ArrowRight class="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white group-hover:text-white transition-colors mb-2">See Atlas in Action</h3>
          <p class="text-[15px] text-slate-500 dark:text-slate-400 group-hover:text-blue-100 transition-colors leading-relaxed mb-6">
            Schedule a live, 1-on-1 walkthrough of the Atlas CRM platform with our product specialists and explore its capabilities.
          </p>
          <div class="mt-auto pt-5 border-t border-slate-200/60 dark:border-slate-700/60 group-hover:border-blue-500/50 transition-colors">
            <p class="text-[15px] font-semibold text-blue-600 dark:text-blue-400 group-hover:text-white flex items-center gap-2">
              Book your session
            </p>
          </div>
        </router-link>

        <!-- Contact Sales -->
        <router-link to="/contact-sales" class="group bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/60 dark:border-slate-700/80 hover:bg-blue-600 dark:hover:bg-blue-600 hover:border-blue-500 hover:shadow-[0_8px_30px_rgb(37,99,235,0.2)] transition-all duration-300 rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden hover:-translate-y-1">
          <div class="flex justify-between items-start mb-6">
            <div class="w-14 h-14 bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 group-hover:text-white transition-all shadow-sm group-hover:shadow-none">
              <PhoneCall class="w-7 h-7" />
            </div>
            <div class="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:border-transparent group-hover:bg-white/10 transition-all">
              <ArrowRight class="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white group-hover:text-white transition-colors mb-2">Talk to Sales</h3>
          <p class="text-[15px] text-slate-500 dark:text-slate-400 group-hover:text-blue-100 transition-colors leading-relaxed mb-6">
            Have specific enterprise requirements? Speak directly with our team to discuss custom pricing, integrations, and features.
          </p>
          <div class="mt-auto pt-5 border-t border-slate-200/60 dark:border-slate-700/60 group-hover:border-blue-500/50 transition-colors">
            <p class="text-[15px] font-semibold text-blue-600 dark:text-blue-400 group-hover:text-white flex items-center gap-2">
              Contact us
            </p>
          </div>
        </router-link>

        <!-- Partner Inquiry -->
        <router-link to="/partner-inquiry" class="group bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/60 dark:border-slate-700/80 hover:bg-blue-600 dark:hover:bg-blue-600 hover:border-blue-500 hover:shadow-[0_8px_30px_rgb(37,99,235,0.2)] transition-all duration-300 rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden hover:-translate-y-1">
          <div class="flex justify-between items-start mb-6">
            <div class="w-14 h-14 bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 group-hover:text-white transition-all shadow-sm group-hover:shadow-none">
              <Users class="w-7 h-7" />
            </div>
            <div class="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:border-transparent group-hover:bg-white/10 transition-all">
              <ArrowRight class="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white group-hover:text-white transition-colors mb-2">Become a Partner</h3>
          <p class="text-[15px] text-slate-500 dark:text-slate-400 group-hover:text-blue-100 transition-colors leading-relaxed mb-6">
            Join the expanding Atlas ecosystem. Explore lucrative agency, referral, or technology partnership opportunities with us.
          </p>
          <div class="mt-auto pt-5 border-t border-slate-200/60 dark:border-slate-700/60 group-hover:border-blue-500/50 transition-colors">
            <p class="text-[15px] font-semibold text-blue-600 dark:text-blue-400 group-hover:text-white flex items-center gap-2">
              Apply now
            </p>
          </div>
        </router-link>

        <!-- Waitlist -->
        <router-link to="/waitlist" class="group bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/60 dark:border-slate-700/80 hover:bg-blue-600 dark:hover:bg-blue-600 hover:border-blue-500 hover:shadow-[0_8px_30px_rgb(37,99,235,0.2)] transition-all duration-300 rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden hover:-translate-y-1">
          <div class="flex justify-between items-start mb-6">
            <div class="w-14 h-14 bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 group-hover:text-white transition-all shadow-sm group-hover:shadow-none">
              <Clock class="w-7 h-7" />
            </div>
            <div class="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:border-transparent group-hover:bg-white/10 transition-all">
              <ArrowRight class="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white group-hover:text-white transition-colors mb-2">Join the Waitlist</h3>
          <p class="text-[15px] text-slate-500 dark:text-slate-400 group-hover:text-blue-100 transition-colors leading-relaxed mb-6">
            Not quite ready to commit? Get on the VIP list for early access to our next generation of autonomous AI features.
          </p>
          <div class="mt-auto pt-5 border-t border-slate-200/60 dark:border-slate-700/60 group-hover:border-blue-500/50 transition-colors">
            <p class="text-[15px] font-semibold text-blue-600 dark:text-blue-400 group-hover:text-white flex items-center gap-2">
              Sign up
            </p>
          </div>
        </router-link>

      </div>  
    </div>

    <!-- FAQ Section -->
    <div class="w-full max-w-4xl mx-auto px-6 sm:px-12 pt-16 pb-24 relative z-10">
      <div class="text-center mb-12 animate-fade-blur delay-200">
        <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 transition-colors">Frequently Asked Questions</h2>
        <p class="text-slate-500 dark:text-slate-400 text-lg transition-colors">Everything you need to know about integrating Atlas AI into your workflow.</p>
      </div>
      
      <div class="flex flex-col gap-4 animate-fade-blur delay-300">
        <div 
          v-for="(faq, index) in faqs" 
          :key="index"
          class="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/60 dark:border-slate-700/80 hover:border-blue-300/50 dark:hover:border-blue-500/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
        >
          <button 
            @click="toggleFaq(index)" 
            class="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
          >
            <span class="font-bold text-slate-800 dark:text-slate-200 text-base sm:text-lg transition-colors">{{ faq.question }}</span>
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0 transition-transform duration-300"
              :class="{ 'rotate-180': activeFaq === index }"
            >
              <ChevronDown class="w-5 h-5" />
            </div>
          </button>
          
          <div 
            class="px-6 overflow-hidden transition-all duration-300 ease-in-out"
            :class="activeFaq === index ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'"
          >
            <p class="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed transition-colors">
              {{ faq.answer }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="w-full py-10 px-6 md:px-12 relative z-10 border-t border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm mt-auto transition-colors">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
        
        <!-- Column 1: Brand -->
        <div class="flex flex-col items-center text-center gap-3">
          <div class="w-16 h-16 rounded-2xl bg-white/40 dark:bg-slate-800/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(37,99,235,0.15)] dark:shadow-xl flex items-center justify-center p-3 border border-white/80 dark:border-slate-700/50 mb-1 relative overflow-hidden group">
            <!-- Light reflection effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-white/80 via-white/20 to-transparent dark:from-white/10 dark:via-transparent opacity-70 pointer-events-none"></div>
            
            <div class="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 blur-xl group-hover:bg-blue-400/20 dark:group-hover:bg-blue-400/30 transition-colors"></div>
            <img :src="AtlasLogo" alt="Atlas Logo" class="w-full h-auto relative z-10 drop-shadow-md" />
          </div>
          <h4 class="text-[15px] font-extrabold text-slate-900 dark:text-white transition-colors">Atlas AI Workforces</h4>
          <p class="text-[14px] font-medium text-slate-500 dark:text-slate-400 transition-colors leading-relaxed">
            Deploy specialized AI workforces across your business.
          </p>
        </div>

        <!-- Column 2: Explore -->
        <div class="flex flex-col gap-2.5 items-center lg:items-start">
          <h5 class="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-1">Explore</h5>
          <router-link to="/assessment" class="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">AI Assessment</router-link>
          <router-link to="/requestdemo" class="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Request Demo</router-link>
          <router-link to="/contact-sales" class="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact Sales</router-link>
          <router-link to="/partner-inquiry" class="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Partner Inquiry</router-link>
          <router-link to="/waitlist" class="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Join Waitlist</router-link>
        </div>

        <!-- Column 3: Company & Legal -->
        <div class="flex flex-col gap-2.5 items-center lg:items-start">
          <h5 class="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-1">Company</h5>
          <a href="#" class="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About Us</a>
          <a href="#" class="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</a>
          <a href="#" class="text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</a>
          
          <router-link 
            to="/admin" 
            class="group flex items-center gap-1.5 text-[13px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm px-3 py-1.5 rounded-full transition-all mt-1"
          >
            <ShieldUser class="w-3.5 h-3.5" />
            <span>Staff Login</span>
            <ArrowRight class="w-3.5 h-3.5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
          </router-link>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="max-w-7xl mx-auto mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <p class="text-[13px] font-medium text-slate-500 dark:text-slate-400">
          &copy; 2026 DDTech. Atlas AI Workforce Platform. All rights reserved.
        </p>
        <p class="text-[13px] font-bold text-slate-400 dark:text-slate-500">
          Atlas — AI Workforce Platform
        </p>
      </div>
    </footer>
  </main>
</template>

<style scoped>
.animate-fade-blur {
  opacity: 0;
  animation: fade-blur-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fade-blur-in {
  0% {
    opacity: 0;
    filter: blur(12px);
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    filter: blur(0px);
    transform: translateY(0);
  }
}

.delay-100 {
  animation-delay: 100ms;
}
.delay-200 {
  animation-delay: 200ms;
}

@keyframes orb-float-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(5%, 5%) scale(1.05); }
  66% { transform: translate(-2%, 8%) scale(0.95); }
}

@keyframes orb-float-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-5%, -8%) scale(0.95); }
  66% { transform: translate(5%, -5%) scale(1.05); }
}

@keyframes orb-float-3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(8%, -5%) scale(1.1); }
}

.animate-orb-1 {
  animation: orb-float-1 20s ease-in-out infinite;
}

.animate-orb-2 {
  animation: orb-float-2 25s ease-in-out infinite;
}

.animate-orb-3 {
  animation: orb-float-3 15s ease-in-out infinite;
}
</style>
