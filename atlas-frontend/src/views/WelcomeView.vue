<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Rocket, FileSearch, Users, PhoneCall, Clock, ArrowRight, CheckCircle2 } from '@lucide/vue'
</script>

<template>
  <main class="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
    <!-- Living AI Orbs (Atlas Identity) -->
    <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none mix-blend-multiply animate-orb-1"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none mix-blend-multiply animate-orb-2"></div>
    <div class="absolute top-[30%] left-[30%] w-[40%] h-[40%] bg-sky-400/10 blur-[100px] rounded-full pointer-events-none mix-blend-multiply animate-orb-3"></div>

    <div class="flex flex-col items-center justify-center flex-1 px-6 sm:px-12 pt-32 pb-16 text-center relative z-10">
      
      <h1 class="text-5xl font-extrabold text-slate-900 sm:text-6xl lg:text-7xl mb-6 animate-fade-blur tracking-tight">
        Welcome to Atlas
      </h1>
      <p class="mt-4 max-w-2xl text-lg leading-relaxed text-slate-500 sm:text-xl mb-12 animate-fade-blur delay-100">
        Empower your business with AI-driven insights. Streamline workflows, boost productivity, and unlock new possibilities with our autonomous workforce.
      </p>

      <!-- Advanced Card Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-blur delay-200 w-full max-w-5xl text-left">
        
        <!-- Get Assessment (Primary/Highlighted) - Spans 2 columns -->
        <router-link to="/assessment" class="group lg:col-span-2 bg-white/60 backdrop-blur-xl border border-white/60 hover:bg-blue-600 hover:border-blue-500 hover:shadow-[0_8px_30px_rgb(37,99,235,0.4)] transition-all duration-300 rounded-3xl p-8 flex flex-col md:flex-row items-start md:items-center gap-8 relative overflow-hidden hover:-translate-y-1">
          <!-- Decorative blur inside card -->
          <div class="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 group-hover:bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:scale-125 transition-all duration-700"></div>
          
          <div class="w-16 h-16 shrink-0 bg-blue-50/80 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 group-hover:text-white transition-all shadow-sm group-hover:shadow-none relative z-10">
            <FileSearch class="w-8 h-8" />
          </div>
          
          <div class="flex-1 relative z-10">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 group-hover:bg-blue-500/50 group-hover:border-blue-400/50 group-hover:text-white transition-colors text-[11px] font-bold uppercase tracking-wider mb-3">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 group-hover:bg-white opacity-75 transition-colors"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-600 group-hover:bg-white transition-colors"></span>
              </span>
              Recommended Start
            </div>
            <h3 class="text-2xl font-bold text-slate-900 group-hover:text-white transition-colors mb-2">Request AI Assessment</h3>
            <p class="text-[15px] text-slate-500 group-hover:text-blue-100 transition-colors leading-relaxed mb-5 max-w-2xl">
              Not sure where to begin? Let our experts analyze your current business processes and provide a personalized roadmap showing exactly where AI can save you time and increase revenue.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 text-sm text-slate-600 group-hover:text-blue-50 font-medium transition-colors">
              <div class="flex items-center gap-2"><CheckCircle2 class="w-4 h-4 text-blue-500 group-hover:text-blue-300 transition-colors"/> 100% Free Analysis</div>
              <div class="flex items-center gap-2"><CheckCircle2 class="w-4 h-4 text-blue-500 group-hover:text-blue-300 transition-colors"/> Custom ROI Report</div>
              <div class="flex items-center gap-2"><CheckCircle2 class="w-4 h-4 text-blue-500 group-hover:text-blue-300 transition-colors"/> 24h Turnaround</div>
            </div>
          </div>
          
          <div class="hidden md:flex shrink-0 items-center justify-center w-12 h-12 rounded-full border border-slate-200 text-slate-400 group-hover:border-transparent group-hover:bg-white group-hover:text-blue-600 group-hover:translate-x-2 transition-all relative z-10">
            <ArrowRight class="w-5 h-5" />
          </div>
        </router-link>

        <!-- Request Demo -->
        <router-link to="/requestdemo" class="group bg-white/60 backdrop-blur-xl border border-white/60 hover:bg-blue-600 hover:border-blue-500 hover:shadow-[0_8px_30px_rgb(37,99,235,0.2)] transition-all duration-300 rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden hover:-translate-y-1">
          <div class="flex justify-between items-start mb-6">
            <div class="w-14 h-14 bg-blue-50/80 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 group-hover:text-white transition-all shadow-sm group-hover:shadow-none">
              <Rocket class="w-7 h-7" />
            </div>
            <div class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-transparent group-hover:bg-white/10 transition-all">
              <ArrowRight class="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </div>
          <h3 class="text-xl font-bold text-slate-900 group-hover:text-white transition-colors mb-2">See Atlas in Action</h3>
          <p class="text-[15px] text-slate-500 group-hover:text-blue-100 transition-colors leading-relaxed mb-6">
            Schedule a live, 1-on-1 walkthrough of the Atlas CRM platform with our product specialists and explore its capabilities.
          </p>
          <div class="mt-auto pt-5 border-t border-slate-200/60 group-hover:border-blue-500/50 transition-colors">
            <p class="text-[15px] font-semibold text-blue-600 group-hover:text-white flex items-center gap-2">
              Book your session
            </p>
          </div>
        </router-link>

        <!-- Contact Sales -->
        <router-link to="/contact-sales" class="group bg-white/60 backdrop-blur-xl border border-white/60 hover:bg-blue-600 hover:border-blue-500 hover:shadow-[0_8px_30px_rgb(37,99,235,0.2)] transition-all duration-300 rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden hover:-translate-y-1">
          <div class="flex justify-between items-start mb-6">
            <div class="w-14 h-14 bg-blue-50/80 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 group-hover:text-white transition-all shadow-sm group-hover:shadow-none">
              <PhoneCall class="w-7 h-7" />
            </div>
            <div class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-transparent group-hover:bg-white/10 transition-all">
              <ArrowRight class="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </div>
          <h3 class="text-xl font-bold text-slate-900 group-hover:text-white transition-colors mb-2">Talk to Sales</h3>
          <p class="text-[15px] text-slate-500 group-hover:text-blue-100 transition-colors leading-relaxed mb-6">
            Have specific enterprise requirements? Speak directly with our team to discuss custom pricing, integrations, and features.
          </p>
          <div class="mt-auto pt-5 border-t border-slate-200/60 group-hover:border-blue-500/50 transition-colors">
            <p class="text-[15px] font-semibold text-blue-600 group-hover:text-white flex items-center gap-2">
              Contact us
            </p>
          </div>
        </router-link>

        <!-- Partner Inquiry -->
        <router-link to="/partner-inquiry" class="group bg-white/60 backdrop-blur-xl border border-white/60 hover:bg-blue-600 hover:border-blue-500 hover:shadow-[0_8px_30px_rgb(37,99,235,0.2)] transition-all duration-300 rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden hover:-translate-y-1">
          <div class="flex justify-between items-start mb-6">
            <div class="w-14 h-14 bg-blue-50/80 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 group-hover:text-white transition-all shadow-sm group-hover:shadow-none">
              <Users class="w-7 h-7" />
            </div>
            <div class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-transparent group-hover:bg-white/10 transition-all">
              <ArrowRight class="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </div>
          <h3 class="text-xl font-bold text-slate-900 group-hover:text-white transition-colors mb-2">Become a Partner</h3>
          <p class="text-[15px] text-slate-500 group-hover:text-blue-100 transition-colors leading-relaxed mb-6">
            Join the expanding Atlas ecosystem. Explore lucrative agency, referral, or technology partnership opportunities with us.
          </p>
          <div class="mt-auto pt-5 border-t border-slate-200/60 group-hover:border-blue-500/50 transition-colors">
            <p class="text-[15px] font-semibold text-blue-600 group-hover:text-white flex items-center gap-2">
              Apply now
            </p>
          </div>
        </router-link>

        <!-- Waitlist -->
        <router-link to="/waitlist" class="group bg-white/60 backdrop-blur-xl border border-white/60 hover:bg-blue-600 hover:border-blue-500 hover:shadow-[0_8px_30px_rgb(37,99,235,0.2)] transition-all duration-300 rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden hover:-translate-y-1">
          <div class="flex justify-between items-start mb-6">
            <div class="w-14 h-14 bg-blue-50/80 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 group-hover:text-white transition-all shadow-sm group-hover:shadow-none">
              <Clock class="w-7 h-7" />
            </div>
            <div class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-transparent group-hover:bg-white/10 transition-all">
              <ArrowRight class="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </div>
          <h3 class="text-xl font-bold text-slate-900 group-hover:text-white transition-colors mb-2">Join the Waitlist</h3>
          <p class="text-[15px] text-slate-500 group-hover:text-blue-100 transition-colors leading-relaxed mb-6">
            Not quite ready to commit? Get on the VIP list for early access to our next generation of autonomous AI features.
          </p>
          <div class="mt-auto pt-5 border-t border-slate-200/60 group-hover:border-blue-500/50 transition-colors">
            <p class="text-[15px] font-semibold text-blue-600 group-hover:text-white flex items-center gap-2">
              Sign up
            </p>
          </div>
        </router-link>

      </div>  
    </div>

    <!-- Footer -->
    <footer class="py-6 text-center text-xs text-slate-400 relative z-10 border-t border-slate-200/60 bg-white/50 backdrop-blur-sm mt-auto">
      <p>(c) 2026 Atlas AI.</p>
      <a href="/admin" class="hover:text-blue-600 font-medium transition-colors inline-block mt-2">
        Staff Login &rarr;
      </a>
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