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
                v-for="i in 6"
                :key="i-1"
                type="text"
                maxlength="1"
                :ref="(el) => setRef(el, i-1)"
                v-model="code[i-1]"
                @input="handleInput($event, i-1)"
                @keydown="handleKeydown($event, i-1)"
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
import { useRoute, useRouter } from 'vue-router'
import api from '../utils/axios'
import { ref, computed, onMounted, watch, ComponentPublicInstance } from 'vue'

const route = useRoute()
const router = useRouter()

// Form state
const code = ref<string[]>(Array(6).fill(''))
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
const decodedFullName = computed(() => decodeURIComponent(route.params.fullName as string))

// Ref handling
const setRef = (el: ComponentPublicInstance | Element | null, index: number) => {
  if (el && 'focus' in el) {
    codeInputs.value[index] = el as HTMLInputElement
  }
}

// Input handling
const handleInput = (event: Event, index: number) => {
  const input = event.target as HTMLInputElement
  const value = input.value

  if (value && index < 5 && codeInputs.value[index + 1]) {
    codeInputs.value[index + 1].focus()
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
  const pastedText = event.clipboardData?.getData('text')
  if (!pastedText) return
  
  const digits = pastedText.trim().split('').filter(char => /\d/.test(char)).slice(0, 6)
  console.log('Processed digits:', digits)
  
  // Update each position directly
  digits.forEach((digit, index) => {
    code.value[index] = digit
  })

  // Fill remaining positions with empty strings
  for (let i = digits.length; i < 6; i++) {
    code.value[i] = ''
  }

  // Focus last filled or first empty position
  const focusIndex = Math.min(digits.length, 5)
  codeInputs.value[focusIndex]?.focus()
}

// API calls
const resendCode = async () => {
  if (canResend.value) return
  
  try {
    await api.post('/auth/register/initiate', {
      email: decodedEmail.value,
      username: decodedUsername.value,
      full_name: decodedFullName.value
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
    const pendingRegistration = JSON.parse(localStorage.getItem('pendingRegistration') ?? '{"fullName":""}')
    const { data } = await api.post('/auth/register/complete', {
      email: decodedEmail.value,
      username: decodedUsername.value,
      verification_code: verificationCode.value,
      full_name: pendingRegistration.fullName
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
      router.push({ name: 'login' })
    }, 1500)

  } catch (e: any) {
    error.value = Array.isArray(e.response?.data?.detail) 
      ? e.response?.data?.detail[0]?.msg 
      : e.response?.data?.detail || 'Failed to verify code'
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