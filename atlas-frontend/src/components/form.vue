<script setup>
import { onMounted, ref, computed } from 'vue';
import { apiClient } from '../utils/api';
import { RouterLink } from 'vue-router';
import { Form, Field, ErrorMessage } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';

const turnstileBox = ref(null);
const turnstileToken = ref('');


onMounted(() => {
  const script = document.createElement('script');
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  script.async = true;
  script.defer = true;
  
  script.onload = () => {
    window.turnstile.render(turnstileBox.value, {
      sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
      theme: 'light',
      callback: (token) => {
        turnstileToken.value = token;
      }
    });
  };
  
  document.head.appendChild(script);
});


const props = defineProps({
  type: {
    type: String,
    default: 'demo'
  }
});

const schema = toTypedSchema(
  z.object({
    full_name: z.string({ required_error: "Full name is required" }).min(1, "Full name is required").max(50, "Name is too long").regex(/^[a-zA-Z\s\.,]+$/, "Only letters, spaces, dots, and commas allowed"),
    company_name: z.string({ required_error: "Company name is required" }).min(1, "Company name is required").max(50, "Company name is too long"),
    phone: z.string().max(15, "Phone number is too long").regex(/^[0-9\+]*$/, "Only numbers and + allowed").optional().or(z.literal('')),
    email: z.string({ required_error: "Email is required" }).min(1, "Email is required").email("Invalid email format").max(50, "Email is too long"),
    country: z.string().optional().or(z.literal('')),
    business_type: z.string().optional().or(z.literal('')),
    industry: z.string().max(50, "Industry name is too long").optional().or(z.literal('')),
    role: z.string({ required_error: "Role is required" }).min(1, "Role is required").max(50, "Role is too long"),
    website_url: z.string().url("Invalid URL format").max(500, "URL is too long").optional().or(z.literal('')),
    company_size: z.string().optional().or(z.literal('')),
    automation_interest: z.string().optional().or(z.literal('')),
    preferred_contact_method: z.string().optional().or(z.literal('')),
    current_problem: z.string().max(500, "Text is too long").optional().or(z.literal('')),
    message: z.string().max(500, "Text is too long").optional().or(z.literal('')),
    consent_status: z.boolean().refine(val => val === true, {
      message: "You must agree to the Privacy Policy"
    })
  })
);

const initialValues = {
  full_name: '',
  company_name: '',
  phone: '',
  email: '',
  country: '',
  business_type: '',
  industry: '',
  role: '',
  website_url: '',
  company_size: '',
  automation_interest: '',
  preferred_contact_method: '',
  current_problem: '',
  message: '',
  consent_status: false
};

const isSubmitting = ref(false);
const submitMessage = ref('');
const isSuccess = ref(false);

const successTitle = computed(() => {
  switch (props.type) {
    case 'demo': return "Permintaan Demo Berhasil!";
    case 'assessment': return "Assessment Berhasil Dikirim!";
    case 'waitlist': return "Terdaftar di Waitlist!";
    case 'contact': return "Pesan Berhasil Dikirim!";
    case 'partner': return "Pengajuan Kemitraan Berhasil!";
    default: return "Form Berhasil Dikirim!";
  }
});

const successMessage = computed(() => {
  switch (props.type) {
    case 'demo': return "Terima kasih! Tim kami akan segera memproses jadwal demo Anda dan menghubungi Anda kembali.";
    case 'assessment': return "Terima kasih telah mengisi assessment. Tim kami akan menganalisa profil Anda dan segera memberikan rekomendasi terbaik.";
    case 'waitlist': return "Terima kasih telah bergabung. Tim kami akan segera memproses permintaan Anda dan menghubungi Anda kembali.";
    case 'contact': return "Terima kasih telah menghubungi kami. Representatif dari tim Sales kami akan segera merespons Anda.";
    case 'partner': return "Terima kasih atas pengajuan Anda. Tim kemitraan kami akan meninjau data Anda dan menghubungi Anda segera.";
    default: return "Terima kasih atas ketertarikan Anda. Tim kami akan segera memproses permintaan Anda dan menghubungi Anda kembali.";
  }
});

const submitForm = async (values, { resetForm }) => {
  // PENCEGAHAN: Jangan kirim form jika Cloudflare belum dicentang
  if (!turnstileToken.value) {
    submitMessage.value = "Mohon centang kotak keamanan (Cloudflare) terlebih dahulu.";
    return;
  }

  isSubmitting.value = true;
  submitMessage.value = '';
  
  const payload = {
    ...values,
    cf_turnstile_token: turnstileToken.value, // Sisipkan token ke Backend
    source_page: window.location.pathname,
    utm_source: sessionStorage.getItem('saved_traffic_source') || 'direct',
    utm_medium: sessionStorage.getItem('saved_utm_medium') || '',
    utm_campaign: sessionStorage.getItem('saved_utm_campaign') || ''
  };

  console.log("PAYLOAD YANG DIKIRIM KE AXIOS:", payload);

  try {
    const response = await apiClient.post('/api/leads', payload);
    if(response.status === 200 || response.status === 201) {
      isSuccess.value = true;
      resetForm();
    }
  } catch (error) {
    console.error("Gagal mengirim lead:", error);
    submitMessage.value = "Terjadi kesalahan. Silakan coba lagi.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="bg-fbg p-8 rounded-2xl">
    <!-- Success State -->
    <div v-if="isSuccess" class="flex flex-col items-center justify-center py-16 text-center animate-fade-in w-full min-h-[400px]">
      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <h3 class="text-2xl lg:text-3xl font-bold text-[#0F172A] mb-4">{{ successTitle }}</h3>
      <p class="text-[#64748B] text-lg max-w-md mx-auto leading-relaxed">{{ successMessage }}</p>
    </div>

    <!-- Form State -->
    <Form v-else :validation-schema="schema" :initial-values="initialValues" @submit="submitForm" class="grid grid-cols-1 lg:grid-cols-2 gap-4" novalidate v-slot="{ meta }">
      <div class="flex flex-col">
        <label for="full_name" class="text-sm font-medium text-ff">Full Name</label>
        <Field
          type="text"
          id="full_name"
          name="full_name"
          placeholder="Jhon Smith"
          class="w-full border border-gray-300 text-ff rounded-md placeholder:text-gray-400 p-3 mt-1 focus:border-blue-500 focus:outline-none"
          maxlength="50"
          required
        />
        <ErrorMessage name="full_name" class="text-red-500 text-sm mt-1" />
      </div>

      <div class="flex flex-col">
        <label for="company_name" class="text-sm font-medium text-ff">Company Name</label>
        <Field
          type="text"
          id="company_name"
          name="company_name"
          placeholder="Your company name"
          class="w-full border border-gray-300 text-ff rounded-md placeholder:text-gray-400 p-3 mt-1 focus:border-blue-500 focus:outline-none"
          maxlength="50"
          required
        />
        <ErrorMessage name="company_name" class="text-red-500 text-sm mt-1" />
      </div>

      <div class="flex flex-col" v-if="type !== 'waitlist'">
        <label for="phone" class="text-sm font-medium text-ff">Phone Number</label>
        <Field
          type="tel"
          id="phone"
          name="phone"
          placeholder="+61 xxx xxx xxx"
          class="w-full border border-gray-300 text-ff rounded-md placeholder:text-gray-400 p-3 mt-1 focus:border-blue-500 focus:outline-none"
          maxlength="15"
          oninput="this.value = this.value.replace(/[^0-9+]/g, '')"
          required
        />
        <ErrorMessage name="phone" class="text-red-500 text-sm mt-1" />
      </div>

      <div class="flex flex-col">
        <label for="email" class="text-sm font-medium text-ff">Email</label>
        <Field
          type="email"
          id="email"
          name="email"
          placeholder="Email"
          class="w-full border border-gray-300 text-ff rounded-md placeholder:text-gray-400 p-3 mt-1 focus:border-blue-500 focus:outline-none"
          maxlength="50"
          required
        />
        <ErrorMessage name="email" class="text-red-500 text-sm mt-1" />
      </div>

      <div class="flex flex-col" v-if="type !== ''">
        <label for="country" class="text-sm font-medium text-ff">Country</label>
        <Field
          as="select"
          id="country"
          name="country"
          class="w-full border border-gray-300 rounded-md text-ff placeholder:text-gray-400 p-3 mt-1 focus:border-blue-500 focus:outline-none"
          required
        >
          <option value="" disabled selected>Select country</option>
          <option value="australia">Australia</option>
          <option value="newzealand">New Zealand</option>
          <option value="Indonesia">Indonesia</option>
          <option value="Other">Other</option>
        </Field>
        <ErrorMessage name="country" class="text-red-500 text-sm mt-1" />
      </div>

      <div class="flex flex-col" v-if="['demo', 'assessment'].includes(type)">
        <label for="business_type" class="text-sm font-medium text-ff">Business Type</label>
        <Field
          as="select"
          id="business_type"
          name="business_type"
          class="w-full border border-gray-300 rounded-md text-ff placeholder:text-gray-400 p-3 mt-1 focus:border-blue-500 focus:outline-none"
          required
        >
          <option value="" disabled selected>Select business type</option>
          <option value="mortgagebroker">Mortgage Broker</option>
          <option value="financebroker">Finance Broker</option>
          <option value="other">Other</option>
        </Field>
        <ErrorMessage name="business_type" class="text-red-500 text-sm mt-1" />
      </div>

      <div class="flex flex-col" v-if="type !== 'partner'">
        <label for="industry" class="text-sm font-medium text-ff">Industry</label>
        <Field
          type="text"
          id="industry"
          name="industry"
          placeholder="Finance, IT, dll."
          class="w-full border border-gray-300 text-ff rounded-md placeholder:text-gray-400 p-3 mt-1 focus:border-blue-500 focus:outline-none"
          maxlength="50"
          required
        />
        <ErrorMessage name="industry" class="text-red-500 text-sm mt-1" />
      </div>

      <div class="flex flex-col">
        <label for="role" class="text-sm font-medium text-ff">Role</label>
        <Field
          type="text"
          id="role"
          name="role"
          placeholder="CEO, Manager, dll."
          class="w-full border border-gray-300 text-ff rounded-md placeholder:text-gray-400 p-3 mt-1 focus:border-blue-500 focus:outline-none"
          maxlength="50"
          required
        />
        <ErrorMessage name="role" class="text-red-500 text-sm mt-1" />
      </div>

      <div class="flex flex-col" v-if="type !== 'waitlist'">
        <label for="website_url" class="text-sm font-medium text-ff">Website URL</label>
        <Field
          type="url"
          id="website_url"
          name="website_url"
          placeholder="https://example.com"
          class="w-full border border-gray-300 text-ff rounded-md placeholder:text-gray-400 p-3 mt-1 focus:border-blue-500 focus:outline-none"
          maxlength="500"
          required
        />
        <ErrorMessage name="website_url" class="text-red-500 text-sm mt-1" />
      </div>

      <div class="flex flex-col" v-if="['demo', 'assessment', 'contact'].includes(type)">
        <label for="company_size" class="text-sm font-medium text-ff">Company Size</label>
        <Field
          as="select"
          id="company_size"
          name="company_size"
          class="w-full border border-gray-300 rounded-md text-ff placeholder:text-gray-400 p-3 mt-1 focus:border-blue-500 focus:outline-none"
          required
        >
          <option value="" disabled selected>Select company size</option>
          <option value="1-10">1-10 employees</option>
          <option value="11-50">11-50 employees</option>
          <option value="51-200">51-200 employees</option>
          <option value="201-500">201-500 employees</option>
          <option value="501+">501+ employees</option>
        </Field>
        <ErrorMessage name="company_size" class="text-red-500 text-sm mt-1" />
      </div>

      <div class="flex flex-col" v-if="['demo', 'assessment'].includes(type)">
        <label for="automation_interest" class="text-sm font-medium text-ff">Automation Interest</label>
        <Field
          as="select"
          id="automation_interest"
          name="automation_interest"
          class="w-full border border-gray-300 text-ff rounded-md placeholder:text-gray-400 p-3 mt-1 focus:border-blue-500 focus:outline-none"
          required
        >
          <option value="" disabled selected>Select level</option>
          <option value="1">A1</option>
          <option value="2">A2</option>
          <option value="3">A3</option>
          <option value="4">A4</option>
          <option value="5">A5</option>
        </Field>
        <ErrorMessage name="automation_interest" class="text-red-500 text-sm mt-1" />
      </div>

      <div class="flex flex-col" v-if="type !== 'waitlist'">
        <label for="preferred_contact_method" class="text-sm font-medium text-ff">Preferred Contact Method</label>
        <Field
          as="select"
          id="preferred_contact_method"
          name="preferred_contact_method"
          class="w-full border border-gray-300 text-ff rounded-md p-3 mt-1 focus:border-blue-500 focus:outline-none"
          required
        >
          <option value="" disabled selected>Select method</option>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="whatsapp">WhatsApp</option>
        </Field>
        <ErrorMessage name="preferred_contact_method" class="text-red-500 text-sm mt-1" />
      </div>

      <div class="lg:col-span-2" v-if="['demo', 'assessment'].includes(type)">
        <label for="current_problem" class="text-sm font-medium text-ff">What is your current biggest challenge in running your business?</label>
        <Field
          as="textarea"
          id="current_problem"
          name="current_problem"
          placeholder="Enter your current biggest challenge in running your business"
          class="w-full border border-gray-300 rounded-md text-ff placeholder:text-gray-400 p-3 mt-1 focus:border-blue-500 focus:outline-none"
          maxlength="500"
          required
        />
        <ErrorMessage name="current_problem" class="text-red-500 text-sm mt-1" />
      </div>

      <div class="lg:col-span-2" v-if="['demo', 'contact', 'partner'].includes(type)">
        <label for="message" class="text-sm font-medium text-ff">Message</label>
        <Field
          as="textarea"
          id="message"
          name="message"
          placeholder="Enter your message"
          class="w-full border border-gray-300 rounded-md text-ff placeholder:text-gray-400 p-3 mt-1 focus:border-blue-500 focus:outline-none"
          maxlength="500"
        />
        <ErrorMessage name="message" class="text-red-500 text-sm mt-1" />
      </div>

      <div class="lg:col-span-2">
        <div class="flex items-center gap-2 bg-[#D5D5D5] px-2 py-3 rounded-md">
          <Field
            id="policy"
            name="consent_status"
            type="checkbox"
            :value="true"
            :unchecked-value="false"
            class="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft"
            required
          />
          <label for="policy" class="select-none ms-2 text-sm font-medium text-ff"
            >I agree to the <RouterLink to="/policy" class="text-blue-600 hover:underline">Privacy Policy</RouterLink>
            and consent to being contacted by DDTech regarding this request.</label
          >
        </div>
        <ErrorMessage name="consent_status" class="text-red-500 text-sm mt-1 block" />
      </div>
      
      <div class="lg:col-span-2">
        <div ref="turnstileBox"></div>
      </div>

      <div class="lg:col-span-2">
        <button
          type="submit"
          :disabled="isSubmitting || !meta.valid || !turnstileToken"
          class="bg-ff text-white py-3 w-full rounded-md hover:bg-blue-600 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? 'Submitting...' : 'Submit' }}
        </button>
        <p v-if="submitMessage" class="mt-2 text-center text-sm font-medium text-red-500">{{ submitMessage }}</p>
      </div>
    </Form>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
