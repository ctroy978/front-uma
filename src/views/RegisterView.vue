<!-- src/views/RegisterView.vue -->
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Create your account
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Success Alert -->
        <BaseAlert
          v-if="showSuccess"
          v-model="showSuccess"
          variant="success"
          message="Registration code sent to your email"
          dismissible
        />

        <!-- Error Alert -->
        <BaseAlert
          v-if="error"
          v-model="showError"
          variant="error"
          :message="error"
          dismissible
        />

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Username Input -->
          <BaseInput
            name="username"
            type="text"
            label="Username"
            v-model="formData.username"
            :rules="{ required: true, min: 3, max: 50, pattern: /^[a-zA-Z0-9_]+$/ }"
            autocomplete="username"
            required
          />

          <!-- Email Input -->
          <BaseInput
            name="email"
            type="email"
            label="Email address"
            v-model="formData.email"
            :rules="{ required: true, email: true, pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i }"
            autocomplete="email"
            required
          />

          <!-- Full Name Input -->
          <BaseInput
            name="fullName"
            type="text"
            label="Full name"
            v-model="formData.fullName"
            :rules="{ required: true, min: 2 }"
            autocomplete="name"
            required
          />

          <BaseButton
            type="submit"
            variant="primary"
            :loading="isLoading"
            :disabled="isLoading || showSuccess"
            fullWidth
          >
            Register
          </BaseButton>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../utils/axios'

const router = useRouter()

const formData = ref({
  username: '',
  email: '',
  fullName: ''
})

const isLoading = ref(false)
const error = ref('')
const showError = ref(false)
const showSuccess = ref(false)

const handleSubmit = async () => {
  error.value = ''
  showError.value = false
  showSuccess.value = false
  isLoading.value = true

  try {
    const { data } = await api.post('/auth/register/initiate', {
      username: formData.value.username,
      email: formData.value.email,
      full_name: formData.value.fullName
    })

    // Show success message before redirecting
    showSuccess.value = true
    
    // Delay redirect to show success message
    setTimeout(() => {
      router.push({ 
        name: 'verify',
        params: { email: data.email }
      })
    }, 1500)

  } catch (e: any) {
    error.value = e.response?.data?.detail || 'An error occurred during registration'
    showError.value = true
  } finally {
    isLoading.value = false
  }
}
</script>