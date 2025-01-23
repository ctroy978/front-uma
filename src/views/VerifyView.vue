<!-- VerifyView.vue -->
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Verify your email
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Enter the verification code sent to {{ decodedEmail }}
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <BaseAlert
          v-if="showSuccess"
          v-model="showSuccess"
          variant="success"
          message="Email verified successfully! Creating your account..."
          dismissible
        />

        <BaseAlert
          v-if="error"
          v-model="showError"
          variant="error"
          :message="error"
          dismissible
        />

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="space-y-1">
            <label for="code" class="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <div class="flex justify-between gap-2">
              <input
                v-for="(digit, index) in 6"
                :key="index"
                :ref="el => codeInputs[index] = el"
                type="text"
                maxlength="1"
                v-model="code[index]"
                @input="handleInput($event, index)"
                @keydown="handleKeydown($event, index)"
                @paste="handlePaste"
                class="block w-12 h-12 text-2xl text-center border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="text-sm">
              <button 
                type="button"
                :disabled="canResend" 
                @click="resendCode"
                class="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ resendText }}
              </button>
            </div>
          </div>

          <BaseButton
            type="submit"
            variant="primary"
            :loading="isLoading"
            :disabled="isLoading || !isComplete || showSuccess"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../utils/axios'

const route = useRoute()
const router = useRouter()

// Form state
const code = ref(Array(6).fill(''))
const codeInputs = ref<HTMLInputElement[]>([])
const isLoading = ref(false)
const error = ref('')
const showError = ref(false)
const showSuccess = ref(false)

// Resend timer state
const resendTimeout = ref(60)
const canResend = computed(() => resendTimeout.value > 0)
const resendText = computed(() => 
  canResend.value 
    ? `Resend code in ${resendTimeout.value}s` 
    : 'Resend code'
)

// Computed properties
const isComplete = computed(() => code.value.every(digit => digit))
const verificationCode = computed(() => code.value.join(''))
const decodedEmail = computed(() => decodeURIComponent(route.params.email as string))
const decodedUsername = computed(() => decodeURIComponent(route.params.username as string))

// Input handling
const handleInput = (event: Event, index: number) => {
  const input = event.target as HTMLInputElement
  const value = input.value

  if (value && index < 5) {
    codeInputs.value[index + 1]?.focus()
  }
}

const handleKeydown = (event: KeyboardEvent, index: number) => {
  if (event.key === 'Backspace' && !code.value[index] && index > 0) {
    code.value[index - 1] = ''
    codeInputs.value[index - 1]?.focus()
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text')
  if (!pastedData) return

  const digits = pastedData.slice(0, 6).split('')
  code.value = [...digits, ...Array(6 - digits.length).fill('')]
  
  const lastIndex = Math.min(digits.length, 5)
  codeInputs.value[lastIndex]?.focus()
}

// API calls
const resendCode = async () => {
  if (canResend.value) return
  
  try {
    await api.post('/auth/register/initiate', {
      email: decodedEmail.value,
      username: decodedUsername.value
    })
    
    resendTimeout.value = 60
    startResendTimer()
  } catch (e: any) {
    error.value = e.response?.data?.detail || 'Failed to resend verification code'
    showError.value = true
  }
}

const handleSubmit = async () => {
  if (!isComplete.value) return
  
  isLoading.value = true
  error.value = ''
  showError.value = false
  
  try {
    const { data } = await api.post('/auth/register/complete', {
      email: decodedEmail.value,
      username: decodedUsername.value,
      verification_code: verificationCode.value
    })

    showSuccess.value = true
    
    // Store authentication token
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({
      id: data.user_id,
      role: data.role
    }))
    
    // Redirect after success message
    setTimeout(() => {
      router.push({ name: 'home' })
    }, 1500)

  } catch (e: any) {
    error.value = e.response?.data?.detail || 'Failed to verify code'
    showError.value = true
    code.value = Array(6).fill('')
    codeInputs.value[0]?.focus()
  } finally {
    isLoading.value = false
  }
}

// Timer management
const startResendTimer = () => {
  const timer = setInterval(() => {
    if (resendTimeout.value > 0) {
      resendTimeout.value--
    } else {
      clearInterval(timer)
    }
  }, 1000)
}

// Lifecycle
onMounted(() => {
  codeInputs.value[0]?.focus()
  startResendTimer()
})

// Route protection
watch(
  () => route.params,
  (params) => {
    if (!params.email || !params.username) {
      router.push({ name: 'register' })
    }
  },
  { immediate: true }
)
</script>