<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import MainLayout from '../components/MainLayout.vue';
import { useToast } from '../composables/UseToast';

const { showToast } = useToast();

// ==========================================
// STATE MANAGEMENT & LOCAL STORAGE
// ==========================================
const tasks = ref<any[]>([]);

const loadTasks = () => {
  const saved = localStorage.getItem('atlas_mock_tasks');
  if (saved) {
    tasks.value = JSON.parse(saved);
  } else {
    // Default tasks
    tasks.value = [
      { id: 1, title: 'Follow up demo with Acme Corp', date: '2026-09-01', time: '10:00', type: 'call', priority: 'high', status: 'pending', lead: 'John Doe' },
      { id: 2, title: 'Send proposal to TechFlow', date: '2026-09-01', time: '14:00', type: 'email', priority: 'medium', status: 'pending', lead: 'Sarah Smith' },
      { id: 3, title: 'Check in on integration progress', date: '2026-09-02', time: '11:30', type: 'meeting', priority: 'low', status: 'pending', lead: 'Mike Johnson' },
      { id: 4, title: 'Quarterly review preparation', date: '2026-09-03', time: '09:00', type: 'task', priority: 'medium', status: 'completed', lead: '' },
    ];
    saveTasks();
  }
};

const saveTasks = () => {
  localStorage.setItem('atlas_mock_tasks', JSON.stringify(tasks.value));
};

onMounted(() => {
  loadTasks();
  generateCalendar();
});

watch(tasks, () => {
  saveTasks();
}, { deep: true });

// ==========================================
// LIST VIEW FILTERING
// ==========================================
const viewMode = ref('list'); // 'list' or 'calendar'
const filterStatus = ref('all'); // 'all', 'pending', 'completed'

const filteredTasks = computed(() => {
  let result = [...tasks.value];
  if (filterStatus.value !== 'all') {
    result = result.filter(t => t.status === filterStatus.value);
  }
  // Sort by date and time
  return result.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });
});

// ==========================================
// MODAL & CRUD ACTIONS
// ==========================================
const isModalOpen = ref(false);
const newTask = ref({
  title: '',
  date: '',
  time: '',
  type: 'task',
  priority: 'medium',
  lead: ''
});

const openModal = (prefilledDate?: string | Event) => {
  const dateStr = typeof prefilledDate === 'string' ? prefilledDate : '';
  const today = dateStr || new Date().toISOString().split('T')[0] || '';
  newTask.value = {
    title: '',
    date: today,
    time: '09:00',
    type: 'task',
    priority: 'medium',
    lead: ''
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const submitTask = () => {
  if (!newTask.value.title || !newTask.value.date || !newTask.value.time) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }
  
  tasks.value.push({
    id: Date.now(),
    ...newTask.value,
    status: 'pending'
  });
  
  showToast('Task successfully added!', 'success');
  closeModal();
};

const toggleStatus = (task: any) => {
  task.status = task.status === 'completed' ? 'pending' : 'completed';
};

const deleteTask = (id: number) => {
  if (confirm('Are you sure you want to delete this task?')) {
    tasks.value = tasks.value.filter(t => t.id !== id);
    showToast('Task deleted.', 'success');
  }
};

// ==========================================
// UI HELPERS
// ==========================================
const getPriorityClass = (priority: string) => {
  switch(priority) {
    case 'high': return 'bg-red-100 text-red-600 border-red-200';
    case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'low': return 'bg-blue-100 text-blue-600 border-blue-200';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const getTypeColor = (type: string) => {
  switch(type) {
    case 'call': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'email': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'meeting': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'task': return 'bg-gray-100 text-gray-700 border-gray-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const formatTime = (timeStr: string) => {
  if (!timeStr || !timeStr.includes(':')) return timeStr || '';
  const parts = timeStr.split(':');
  const hourStr = parts[0] || '0';
  const minute = parts[1] || '00';
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12; 
  return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
};

const getTypeIcon = (type: string) => {
  switch(type) {
    case 'call': return '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>';
    case 'email': return '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>';
    case 'meeting': return '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>';
    default: return '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>';
  }
};

// ==========================================
// CALENDAR LOGIC
// ==========================================
const currentDate = ref(new Date());
const calendarDays = ref<any[]>([]);

const monthYearString = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
});

const generateCalendar = () => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const days = [];
  
  // Empty blocks for days before start of month
  for (let i = 0; i < firstDay; i++) {
    days.push({ empty: true });
  }
  
  // Real days
  for (let i = 1; i <= daysInMonth; i++) {
    // format to YYYY-MM-DD
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    
    // Find tasks for this day
    const dayTasks = tasks.value.filter(t => t.date === dateStr);
    
    days.push({
      empty: false,
      date: i,
      fullDate: dateStr,
      isToday: dateStr === new Date().toISOString().split('T')[0],
      tasks: dayTasks.sort((a, b) => a.time.localeCompare(b.time))
    });
  }
  
  calendarDays.value = days;
};

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
  generateCalendar();
};

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
  generateCalendar();
};

// Regenerate calendar when tasks change so new tasks appear on it
watch(tasks, generateCalendar, { deep: true });

</script>

<template>
  <MainLayout active-menu="tasks">
    <main class="flex-1 p-8 overflow-y-auto bg-[#F8FAFC]">
      
      <!-- HEADER -->
      <div class="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in">
        <div>
          <h1 class="text-[32px] font-bold text-[#0F172A] tracking-tight">Tasks & Calendar</h1>
          <p class="text-[16px] text-[#64748B] mt-1">Manage your follow-ups, calls, and upcoming meetings.</p>
        </div>
        <button @click="openModal" class="px-5 py-2.5 bg-[#2563EB] text-white text-[14px] font-bold rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add Task
        </button>
      </div>

      <!-- CONTROL BAR -->
      <div class="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm mb-6 flex items-center justify-between animate-fade-in">
        <div class="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button 
            @click="viewMode = 'list'" 
            :class="['px-4 py-1.5 text-[13px] font-bold rounded-md transition-all', viewMode === 'list' ? 'bg-white text-[#2563EB] shadow-sm' : 'text-gray-500 hover:text-gray-700']"
          >
            List View
          </button>
          <button 
            @click="viewMode = 'calendar'" 
            :class="['px-4 py-1.5 text-[13px] font-bold rounded-md transition-all', viewMode === 'calendar' ? 'bg-white text-[#2563EB] shadow-sm' : 'text-gray-500 hover:text-gray-700']"
          >
            Calendar View
          </button>
        </div>

        <div v-if="viewMode === 'list'" class="flex items-center gap-3">
          <select v-model="filterStatus" class="text-[13px] border border-[#E2E8F0] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB] font-medium text-[#475569]">
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <!-- ================= LIST VIEW ================= -->
      <div v-if="viewMode === 'list'" class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden animate-fade-in">
        <div class="divide-y divide-[#E2E8F0]">
          <div v-if="filteredTasks.length === 0" class="p-12 text-center text-gray-500 font-medium">
            No tasks found.
          </div>
          <div 
            v-for="task in filteredTasks" 
            :key="task.id"
            class="p-5 flex items-start gap-4 hover:bg-gray-50 transition group"
            :class="task.status === 'completed' ? 'opacity-60 bg-gray-50' : ''"
          >
            <!-- Checkbox -->
            <button @click="toggleStatus(task)" class="mt-1 flex-shrink-0 transition-transform active:scale-95 focus:outline-none">
              <div :class="['w-6 h-6 rounded border flex items-center justify-center transition-colors', task.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent hover:border-[#2563EB] hover:text-[#2563EB]/30']">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
              </div>
            </button>

            <!-- Task Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-4 mb-1">
                <h3 class="text-[15px] font-bold text-[#0F172A] truncate" :class="task.status === 'completed' ? 'line-through' : ''">{{ task.title }}</h3>
                <span :class="['px-2.5 py-0.5 text-[11px] font-bold uppercase rounded border', getPriorityClass(task.priority)]">
                  {{ task.priority }}
                </span>
              </div>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-[#64748B] font-medium">
                <div class="flex items-center gap-1.5" :class="new Date(`${task.date}T${task.time}`) < new Date() && task.status !== 'completed' ? 'text-red-500 font-bold' : ''">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  {{ task.date }} at {{ formatTime(task.time) }}
                </div>
                <div class="flex items-center gap-1.5">
                  <div v-html="getTypeIcon(task.type)" class="text-[#94A3B8]"></div>
                  <span class="capitalize">{{ task.type }}</span>
                </div>
                <div v-if="task.lead" class="flex items-center gap-1.5 text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded cursor-pointer hover:bg-blue-100">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  {{ task.lead }}
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition">
              <button @click="deleteTask(task.id)" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded focus:outline-none">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= CALENDAR VIEW ================= -->
      <div v-if="viewMode === 'calendar'" class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 text-center animate-fade-in min-h-[500px] flex flex-col items-center">
        
        <div class="w-full max-w-5xl">
          <!-- Calendar Header -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-[20px] font-bold text-[#0F172A]">{{ monthYearString }}</h2>
            <div class="flex gap-2">
              <button @click="prevMonth" class="p-2 border rounded hover:bg-gray-50 focus:outline-none"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg></button>
              <button @click="nextMonth" class="p-2 border rounded hover:bg-gray-50 focus:outline-none"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></button>
            </div>
          </div>
          
          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            <!-- Days of Week -->
            <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="bg-gray-50 py-2 text-[12px] font-bold text-center text-[#64748B] uppercase">
              {{ day }}
            </div>
            
            <!-- Grid Cells -->
            <div 
              v-for="(day, index) in calendarDays" 
              :key="index" 
              @click="!day.empty && openModal(day.fullDate)"
              :class="[
                'min-h-[120px] p-2 border-t border-transparent transition-colors relative flex flex-col',
                day.empty ? 'bg-white' : 'bg-white hover:bg-blue-50 hover:border-blue-200 cursor-pointer'
              ]"
            >
              <div v-if="!day.empty" class="w-full">
                <!-- Date Number -->
                <div class="flex justify-between items-start mb-1">
                  <span :class="['text-[13px] font-bold w-7 h-7 flex items-center justify-center rounded-full', day.isToday ? 'bg-[#2563EB] text-white' : 'text-[#0F172A]']">
                    {{ day.date }}
                  </span>
                </div>
                
                <!-- Tasks for this day -->
                <div class="flex flex-col gap-1 w-full text-left">
                  <div 
                    v-for="task in day.tasks" 
                    :key="task.id"
                    :title="task.title"
                    :class="['text-[10px] font-bold px-1.5 py-0.5 rounded truncate border', getTypeColor(task.type), task.status === 'completed' ? 'opacity-50 line-through' : '']"
                  >
                    {{ formatTime(task.time) }} {{ task.title }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>
  </MainLayout>

  <!-- ================= ADD TASK MODAL ================= -->
  <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm transition-opacity" @click="closeModal"></div>
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 sm:p-8 animate-fade-in">
      <h2 class="text-[22px] font-bold text-[#0F172A] mb-6">Add New Task</h2>
      
      <form @submit.prevent="submitTask" class="space-y-4">
        <div>
          <label class="block text-[13px] font-bold text-[#0F172A] mb-1.5">Task Title <span class="text-red-500">*</span></label>
          <input v-model="newTask.title" type="text" placeholder="e.g. Follow up on proposal" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#2563EB]" required />
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[13px] font-bold text-[#0F172A] mb-1.5">Date <span class="text-red-500">*</span></label>
            <input v-model="newTask.date" type="date" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#2563EB]" required />
          </div>
          <div>
            <label class="block text-[13px] font-bold text-[#0F172A] mb-1.5">Time <span class="text-red-500">*</span></label>
            <input v-model="newTask.time" type="time" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#2563EB]" required />
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[13px] font-bold text-[#0F172A] mb-1.5">Type</label>
            <select v-model="newTask.type" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#2563EB]">
              <option value="task">To-Do / Task</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
            </select>
          </div>
          <div>
            <label class="block text-[13px] font-bold text-[#0F172A] mb-1.5">Priority</label>
            <select v-model="newTask.priority" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#2563EB]">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-[13px] font-bold text-[#0F172A] mb-1.5">Related Lead (Optional)</label>
          <input v-model="newTask.lead" type="text" placeholder="e.g. John Doe / TechCorp" class="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#2563EB]" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-6">
          <button type="button" @click="closeModal" class="px-5 py-2 border border-gray-300 rounded-lg text-[14px] font-bold hover:bg-gray-50 transition">Cancel</button>
          <button type="submit" class="px-5 py-2 bg-[#2563EB] text-white rounded-lg text-[14px] font-bold hover:bg-blue-700 transition">Save Task</button>
        </div>
      </form>
    </div>
  </div>

</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
