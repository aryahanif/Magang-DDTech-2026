<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const canvasRef = ref<HTMLCanvasElement | null>(null);

let animationFrameId: number;

// =====================================
// PARTICLE NETWORK LOGIC
// =====================================
onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = window.innerWidth;
  let height = window.innerHeight;

  const setCanvasSize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  };

  setCanvasSize();
  window.addEventListener('resize', setCanvasSize);

  class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;

    constructor() {
      // Spawn mostly on the right side for the visual balance
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = (Math.random() - 0.5) * 1.5;
      // Varied radius based on the reference image
      this.radius = Math.random() > 0.8 ? Math.random() * 20 + 10 : Math.random() * 4 + 2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off walls
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
      if (!ctx) return;
      // Opacity fades out on the left side (0% at left 40%, 100% at right 60%)
      const opacity = Math.max(0, Math.min(1, (this.x - (width * 0.4)) / (width * 0.2)));
      if (opacity <= 0) return;

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(59, 130, 246, ${opacity * 0.8})`; // blue-500
      ctx.fill();
    }
  }

  const particles: Particle[] = [];
  // Adjust particle count based on screen size
  const particleCount = Math.floor((width * height) / 15000);

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  const animate = () => {
    ctx.clearRect(0, 0, width, height);

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i] as Particle;
      p.update();
      p.draw();
    }

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i] as Particle;
        const p2 = particles[j] as Particle;
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const connectionDistance = 150; // Max distance to draw line
        
        if (distance < connectionDistance) {
          const avgX = (p1.x + p2.x) / 2;
          const posOpacity = Math.max(0, Math.min(1, (avgX - (width * 0.4)) / (width * 0.2)));
          if (posOpacity <= 0) continue;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          // Opacity decreases as distance increases
          const opacity = (1 - (distance / connectionDistance)) * posOpacity;
          ctx.strokeStyle = `rgba(148, 163, 184, ${opacity * 0.6})`; // slate-400
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    animationFrameId = requestAnimationFrame(animate);
  };

  animate();

  onUnmounted(() => {
    window.removeEventListener('resize', setCanvasSize);
    cancelAnimationFrame(animationFrameId);
  });
});

const navigateToWelcome = () => {
  router.push('/welcome');
};
</script>

<template>
  <main class="relative min-h-screen w-full bg-slate-50 overflow-hidden font-sans">
    
    <!-- Canvas for Particle Network -->
    <canvas 
      ref="canvasRef" 
      class="absolute inset-0 z-0 pointer-events-none opacity-80"
    ></canvas>

    <!-- Content Container -->
    <div class="relative z-10 flex flex-col justify-center min-h-screen px-8 sm:px-12 lg:px-20 w-full">
      
      <!-- Top Text -->
      <div class="overflow-hidden mb-6 flex items-start">
        <div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.03)] animate-mask-in-delay-1 hover:bg-white hover:shadow-md transition-all cursor-default group">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-blue-600 drop-shadow-sm"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          <span class="text-[13px] font-bold text-slate-700 tracking-wide bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
            Atlas AI Workforce
          </span>
        </div>
      </div>

      <!-- Main Headline -->
      <div class="max-w-4xl mb-4">
        <!-- Mask In Effect applied to lines -->
        <h1 class="text-4xl sm:text-5xl lg:text-[4.5rem] leading-[1.1] font-bold text-slate-900 tracking-tight">
          <div class="overflow-hidden">
            <span class="block animate-mask-in">Scale your revenue with</span>
          </div>
          <div class="overflow-hidden pb-1">
            <span class="block animate-mask-in-delay-1">an autonomous AI workforce</span>
          </div>
          <div class="overflow-hidden">
            <span class="block animate-mask-in-delay-2">built for modern sales.</span>
          </div>
        </h1>
      </div>

      <!-- Button -->
      <div class="pt-1 mt-4">
        <button 
          @click="navigateToWelcome"
          class="animate-fade-in-up inline-flex items-center justify-center px-10 py-4 text-[16px] font-semibold text-white bg-blue-600 border border-blue-600 rounded-full hover:bg-blue-700 hover:border-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg"
        >
          Get Started
        </button>
      </div>

    </div>
  </main>
</template>

<style scoped>
/* Keyframes for Mask In Animation */
@keyframes maskIn {
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-mask-in {
  animation: maskIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-mask-in-delay-1 {
  animation: maskIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: 0.15s;
  opacity: 0; /* Hidden before animation starts */
}

.animate-mask-in-delay-2 {
  animation: maskIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: 0.3s;
  opacity: 0;
}

.animate-fade-in-up {
  animation: maskIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: 0.5s;
  opacity: 0;
}
</style>
