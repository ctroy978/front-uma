<!-- src/views/VerifyView.vue -->
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Verify your email
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        We've sent a verification code to {{ email }}
      </p>
      <p class="mt-2 text-center text-sm text-gray-600">
        You have 10 minutes to enter the code.
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Success Alert -->
        <BaseAlert
          v-if="showSuccess"
          v-model="showSuccess"
          variant="success"
          message="Registration successful! Redirecting to login..."
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
          <!-- Verification Code Input -->
          <BaseInput
            name="verificationCode"
            type="text"
            label="Verification Code"
            v-model="verificationCode"
            :rules="{ required: true, length: 6, regex: /^[0-9]+$/ }"
            maxlength="6"
            placeholder="Enter 6-digit code"
            :disabled="showSuccess"
            required
          />

          <BaseButton
            type="submit"
            variant="primary"
            :loading="isLoading"
            :disabled="isLoading || showSuccess"
            fullWidth
          >
            Verify Email
          </BaseButton>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../utils/axios'

const router = useRouter()
const route = useRoute()

const email = ref('')
const verificationCode = ref('')
const isLoading = ref(false)
const error = ref('')
const showError = ref(false)
const showSuccess = ref(false)

onMounted(() => {
  // Ensure we have an email from the registration step
  const routeEmail = route.params.email
  if (!routeEmail) {
    router.push({ name: 'register' })
    return
  }
  email.value = routeEmail as string
})

const handleSubmit = async () => {
  error.value = ''
  showError.value = false
  showSuccess.value = false
  isLoading.value = true

  try {
    const { data } = await api.post('/auth/register/complete', {
      username: route.params.username,
      email: email.value,
      verification_code: verificationCode.value
    })

    // Show success message before redirecting
    showSuccess.value = true
    
    // Delay redirect to show success message
    setTimeout(() => {
      router.push({ 
        name: 'login',
        query: { 
          registered: 'true',
          email: email.value,
          role: data.role  // Pass role to login page
        }
      })
    }, 1500)

  } catch (e: any) {
    error.value = e.response?.data?.detail || 'Invalid or expired verification code'
    showError.value = true
  } finally {
    isLoading.value = false
  }
}
</script>