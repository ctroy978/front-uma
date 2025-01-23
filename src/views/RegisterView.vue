<!-- RegisterView.vue -->
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Create your account
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <BaseAlert
          v-if="showSuccess"
          v-model="showSuccess"
          variant="success"
          message="Registration code sent to your email"
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
          <BaseInput
            name="username"
            type="text"
            label="Username"
            v-model="formData.username"
            :error="errors.username"
            @blur="validateField('username')"
            autocomplete="username"
            required
          />

          <BaseInput
            name="email"
            type="email"
            label="Email address"
            v-model="formData.email"
            :error="errors.email"
            @blur="validateField('email')"
            autocomplete="email"
            required
          />

          <BaseInput
            name="fullName"
            type="text"
            label="Full name"
            v-model="formData.fullName"
            :error="errors.fullName"
            @blur="validateField('fullName')"
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

const errors = ref({
  username: '',
  email: '',
  fullName: ''
})

const isLoading = ref(false)
const error = ref('')
const showError = ref(false)
const showSuccess = ref(false)

const validateField = (field: keyof typeof formData.value) => {
  errors.value[field] = ''
  
  switch(field) {
    case 'username':
      if (!formData.value.username) {
        errors.value.username = 'Username is required'
      } else if (formData.value.username.length < 3) {
        errors.value.username = 'Username must be at least 3 characters'
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.value.username)) {
        errors.value.username = 'Username can only contain letters, numbers, and underscores'
      }
      break
      
    case 'email':
      if (!formData.value.email) {
        errors.value.email = 'Email is required'
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.value.email)) {
        errors.value.email = 'Invalid email format'
      }
      break
      
    case 'fullName':
      if (!formData.value.fullName) {
        errors.value.fullName = 'Full name is required'
      } else if (formData.value.fullName.length < 2) {
        errors.value.fullName = 'Full name must be at least 2 characters'
      }
      break
  }
}

const validateForm = () => {
  validateField('username')
  validateField('email')
  validateField('fullName')
  
  return !Object.values(errors.value).some(error => error)
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  error.value = ''
  showError.value = false
  
  try {
    const { data } = await api.post('/auth/register/initiate', {
      username: formData.value.username,
      email: formData.value.email,
      full_name: formData.value.fullName
    })

    showSuccess.value = true
    
    setTimeout(() => {
      
  // Redirect immediately to verify page
  router.push({ 
      name: 'verify',
      params: { 
        email: encodeURIComponent(data.email),
        username: encodeURIComponent(formData.value.username)
      }
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