<template>
  <div class="bg-fbg p-8 rounded-2xl">
    <form class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="flex flex-col ">
        <label for="full_name" class="text-sm font-medium text-ff"
          >Full Name</label
        >
        <input
          type="text"
          id="full_name"
          name="full_name"
          placeholder="Alden Tegar"
          class="w-full border border-gray-300 text-ff rounded-md placeholder:text-gray-400 p-3 mt-1"
          maxlength="50"
          required
        />
      </div>

      <div class="flex flex-col">
        <label for="company_name" class="text-sm font-medium text-ff"
          >Company Name</label
        >
        <input
          type="text"
          id="company_name"
          name="company_name"
          placeholder="DdTech"
          class="w-full border border-gray-300 text-ff rounded-md placeholder:text-gray-400 p-3 mt-1"
          required
        />
      </div>

      <div class="flex flex-col">
        <label for="phone_number" class="text-sm font-medium text-ff"
          >Phone Number</label
        >
        <input
          type="tel"
          id="phone_number"
          name="phone_number"
          placeholder="+61 xxx xxx xxx"
          class="w-full border border-gray-300 text-ff rounded-md placeholder:text-gray-400 p-3 mt-1"
          required
        />
      </div>

      <div class="flex flex-col">
        <label for="email" class="text-sm font-medium text-ff">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Email"
          class="w-full border border-gray-300 text-ff rounded-md placeholder:text-gray-400 p-3 mt-1"
          required
        />
      </div>

      <div class="flex flex-col">
        <label for="country" class="text-sm font-medium text-ff">Country</label>
        <select
          id="country"
          name="country"
          class="w-full border border-gray-300 rounded-md text-ff placeholder:text-gray-400 p-3 mt-1"
          required
        >
          <option value="australia">Australia</option>
          <option value="newzealand">New Zealand</option>
          <option value="Indonesia">Indonesia</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label for="business_type" class="text-sm font-medium text-ff"
          >Business Type</label
        >
        <select
          id="business_type"
          name="business_type"
          class="w-full border border-gray-300 rounded-md text-ff placeholder:text-gray-400 p-3 mt-1"
          required
        >
          <option value="mortgagebroker">Mortgage Broker</option>
          <option value="financebroker">Finance Broker</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label for="automation_interest" class="text-sm font-medium text-ff"
          >Automation Interest</label
        >
        <select
          id="automation_interest"
          name="automation_interest"
          class="w-full border border-gray-300 text-ff rounded-md placeholder:text-gray-400 p-3 mt-1"
          required
        >
          <option value="1">A1</option>
          <option value="2">A2</option>
          <option value="3">A3</option>
          <option value="4">A4</option>
          <option value="5">A5</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label for="contact_method" class="text-sm font-medium text-ff"
          >Preferred Contact Method</label
        >
        <select
          id="contact_method"
          name="contact_method"
          class="w-full border border-gray-300 text-ff rounded-md p-3 mt-1"
          required
        >
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
      </div>

      <div class="lg:col-span-2">
        <label for="current_problem" class="text-sm font-medium text-ff"
          >What is your current biggest challenge in running your
          business?</label
        >
        <textarea
          id="current_problem"
          name="current_problem"
          placeholder="Enter your current biggest challenge in running your business"
          class="w-full border border-gray-300 rounded-md text-ff placeholder:text-gray-400 p-3 mt-1"
          required
        ></textarea>
      </div>

      <div class="lg:col-span-2">
        <label for="message" class="text-sm font-medium text-ff">Message</label>
        <textarea
          id="message"
          name="message"
          placeholder="Enter your message"
          class="w-full border border-gray-300 rounded-md text-ff placeholder:text-gray-400 p-3 mt-1"
        ></textarea>
      </div>

      <div class="lg:col-span-2 flex items-center gap-2 bg-[#D5D5D5] px-2 py-3 rounded-md">
        <input
          id="policy"
          name="policy"
          type="checkbox"
          class="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft"
          required
        />
        <label for="policy" class="select-none ms-2 text-sm font-medium text-ff"
          >I agree to the Privacy Policy and consent to being contacted by
          DDTech regarding this request.</label
        >
      </div>

      <div class="lg:col-span-2">
        <button
          type="submit"
          class="bg-ff text-white py-3 w-full rounded-md hover:bg-blue-600 transition duration-300"
        >
          Submit
        </button>
      </div>
    </form>
  </div>
</template>
