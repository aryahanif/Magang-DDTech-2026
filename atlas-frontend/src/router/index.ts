import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RequestDemoView from '../views/RequestdemoView.vue'
import AssessmentView from '../views/AssessmentView.vue'
import ContactSalesView from '../views/ContactSalesView.vue'
import WaitlistView from '../views/WaitlistView.vue'
import PartnerInquiryView from '../views/PartnerInquiryView.vue'
import PolicyView from '../views/PolicyView.vue'

import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import LeadsView from '../views/LeadsView.vue'
import PipelineView from '../views/PipelineView.vue'
import SettingsView from '../views/SettingsView.vue'
import LeadDetailView from '../views/LeadDetailView.vue'
import TasksView from '../views/TasksView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    //Halaman user
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/requestdemo',
      name: 'requestdemo',
      component: RequestDemoView
    },
    {
      path: '/assessment',
      name: 'assessment',
      component: AssessmentView
    },
    {
      path: '/contact-sales',
      name: 'contact-sales',
      component: ContactSalesView
    },
    {
      path: '/waitlist',
      name: 'waitlist',
      component: WaitlistView
    },
    {
      path: '/partner-inquiry',
      name: 'partner-inquiry',
      component: PartnerInquiryView
    },
    {
      path: '/policy',
      name: 'policy',
      component: PolicyView
    },

    //Halaman admin
    {
      path: '/admin',
      name: 'login',
      component: LoginView
    },
    {
      path: '/admin/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/leads',
      name: 'leads',
      component: LeadsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/leads/:id',
      name: 'lead-detail',
      component: LeadDetailView,
      meta: { requiresAuth: true, activeMenu: 'leads' }
    },
    {
      path: '/admin/pipeline',
      name: 'pipeline',
      component: PipelineView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/tasks',
      name: 'tasks',
      component: TasksView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation Guard: protect admin routes
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('auth_token')

  // If route requires auth and no token → redirect to login
  if (to.meta.requiresAuth && !token) {
    return next({ name: 'login' })
  }

  // If already logged in and trying to access login page → redirect to dashboard
  if (to.name === 'login' && token) {
    return next({ name: 'dashboard' })
  }

  next()
})

export default router
