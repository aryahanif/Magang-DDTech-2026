<script setup lang="ts">
import Form from "../components/form.vue";
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
    <section class="flex flex-col justify-center gap-6 px-8 py-16 sm:px-16 lg:px-24">
      <div class="max-w-xl">
        <h1 class="text-5xl font-extrabold text-ff sm:text-6xl lg:text-7xl animate-slide-in">
          Contact<br />
          Sales
        </h1>

        <p class="mt-6 max-w-lg text-lg leading-7 text-ff sm:text-xl sm:leading-8 animate-slide-in delay-100">
          Ready to transform your business with Atlas? Get in touch with our sales team to discuss pricing and enterprise plans.
        </p>
      </div>
    </section>

    <section class="flex items-center justify-center bg-ff px-5 py-12 sm:px-8 lg:px-12">
      <Form type="contact" />
    </section>
  </div>
</template>
