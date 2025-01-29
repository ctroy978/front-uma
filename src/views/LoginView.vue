<!-- LoginView.vue -->
<template>
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>
  
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <BaseAlert
            v-if="showSuccess"
            v-model="showSuccess"
            variant="success"
            message="Verification code sent to your email"
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
              name="email"
              type="email"
              label="Email address"
              v-model="email"
              :error="emailError"
              @blur="validateEmail"
              autocomplete="email"
              required
            />
  
            <div class="flex items-center justify-between">
              <div class="text-sm">
                <router-link 
                  to="/register" 
                  class="font-medium text-blue-600 hover:text-blue-500"
                >
                  Need an account? Register
                </router-link>
              </div>
            </div>
  
            <BaseButton
              type="submit"
              variant="primary"
              :loading="isLoading"
              :disabled="isLoading || showSuccess"
              fullWidth
            >
              Continue with Email
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
  
  const email = ref('')
  const emailError = ref('')
  const isLoading = ref(false)
  const error = ref('')
  const showError = ref(false)
  const showSuccess = ref(false)
  
  const validateEmail = () => {
    emailError.value = ''
    if (!email.value) {
      emailError.value = 'Email is required'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.value)) {
      emailError.value = 'Invalid email format'
    }
  }
  

const handleSubmit = async () => {
  validateEmail();
  if (emailError.value || isLoading.value) return;

  isLoading.value = true;
  error.value = '';
  showError.value = false;
  
  try {
    console.log('Initiating login for:', email.value);
    const response = await api.post('/auth/login/initiate', {
      email: email.value
    });
    
    
    // Clear any existing state
    localStorage.clear();
    
    // Match registration pattern for storage
    localStorage.setItem('pendingVerification', 'true');
    localStorage.setItem('pendingLogin', JSON.stringify({
      email: email.value
    }));
    
    showSuccess.value = true;

    // Add delay before redirect
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Match registration URL encoding pattern
    router.push({ 
      name: 'verify-login',
      params: { 
        email: encodeURIComponent(email.value)
      }
    });
    
  } catch (error: any) {
    console.error('Login error:', error);
    error.value = error?.response?.data?.detail || 
                  error?.message || 
                  'Failed to initiate login';
    showError.value = true;
    // Clean up any partial state
    localStorage.clear();
    isLoading.value = false;
  }
};
    
  </script>