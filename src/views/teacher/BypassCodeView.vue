<!-- src/views/teacher/BypassCodeView.vue -->
<template>
    <div class="p-6">
      <div class="max-w-3xl mx-auto">
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium leading-6 text-gray-900">Teacher Bypass Code</h3>
            <div class="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                Use your bypass code to help students who are stuck on questions. Secretly enter
                <span class="font-mono bg-gray-100 px-1 rounded whitespace-nowrap">!BYPASS:XXXX</span> (where XXXX is your 4-digit code)
                as an answer to bypass difficult questions. Never share your code with students. 
              </p>
            </div>
            
            <div v-if="loading" class="mt-4">
              <p class="text-sm text-gray-500">Loading...</p>
            </div>
            
            <div v-else-if="error" class="mt-4">
              <p class="text-sm text-red-600">{{ error }}</p>
            </div>
            
            <div v-else class="mt-5">
              <div v-if="currentBypassCode" class="rounded-md bg-blue-50 p-4 mb-5">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <KeyIcon class="h-5 w-5 text-blue-400" aria-hidden="true" />
                  </div>
                  <div class="ml-3 flex-1 md:flex md:justify-between">
                    <p class="text-sm text-blue-700">
                      Your current bypass code is: <strong class="font-mono">{{ currentBypassCode }}</strong>
                    </p>
                  </div>
                </div>
              </div>
  
              <form @submit.prevent="saveBypassCode">
                <div class="mt-5 sm:flex sm:items-center">
                  <div class="w-full sm:max-w-xs">
                    <label for="bypass-code" class="sr-only">Bypass Code</label>
                    <input
                      id="bypass-code"
                      v-model="bypassCode"
                      type="text"
                      inputmode="numeric"
                      pattern="[0-9]{4}"
                      maxlength="4"
                      placeholder="Enter 4-digit code"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      :class="{ 'border-red-300': validationError }"
                    />
                    <p v-if="validationError" class="mt-2 text-sm text-red-600">{{ validationError }}</p>
                  </div>
                  <button
                    type="submit"
                    class="mt-3 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    :disabled="submitting"
                  >
                    {{ currentBypassCode ? 'Update Code' : 'Create Code' }}
                  </button>
                  <button
                    v-if="currentBypassCode"
                    type="button"
                    class="mt-3 inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    @click="deactivateCode"
                    :disabled="submitting"
                  >
                    Deactivate Code
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
  
        <!-- Instructions Card -->
        <div class="mt-8 bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium leading-6 text-gray-900">How to Use the Bypass Code</h3>
            <div class="mt-2 max-w-xl text-sm text-gray-500">
              <ol class="list-decimal pl-5 space-y-2">
                <li>
                  When a student reports being stuck on a question that seems impossible to answer, secretly enter:
                  <span class="font-mono bg-gray-100 px-1 rounded whitespace-nowrap">!BYPASS:XXXX</span> (replace XXXX with your bypass code)
                </li>
                <li>
                  This will allow the student to progress and will also remove that question from the cache, so other students won't encounter it.
                </li>
                <li>
                  For security, never share your bypass code with students and periodically change your bypass code or deactivate it when not needed.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { Key as KeyIcon } from 'lucide-vue-next'
  import api from '@/utils/axios' // Import your existing axios instance
  
  const bypassCode = ref('')
  const currentBypassCode = ref<string | null>(null)
  const validationError = ref('')
  const loading = ref(true)
  const error = ref('')
  const submitting = ref(false)
  
  // Load the current bypass code on component mount
  onMounted(async () => {
    try {
      loading.value = true
      const response = await api.get('/teacher/bypass-code')
      if (response.data.bypass_code) {
        currentBypassCode.value = response.data.bypass_code
      }
    } catch (err: any) {
      error.value = 'Failed to load bypass code. Please try again.'
      console.error('Error loading bypass code:', err)
    } finally {
      loading.value = false
    }
  })
  
  // Validate and save the bypass code
  const saveBypassCode = async () => {
    // Reset validation error
    validationError.value = ''
    
    // Validate the code is exactly 4 digits
    if (!bypassCode.value.match(/^\d{4}$/)) {
      validationError.value = 'Bypass code must be exactly 4 digits'
      return
    }
    
    try {
      submitting.value = true
      const response = await api.post('/teacher/bypass-code', {
        bypass_code: bypassCode.value
      })
      
      // Update the current code and reset form
      currentBypassCode.value = response.data.bypass_code
      bypassCode.value = ''
      
      // Show success message (could add a toast notification here)
    } catch (err: any) {
      error.value = 'Failed to save bypass code. Please try again.'
      console.error('Error saving bypass code:', err)
    } finally {
      submitting.value = false
    }
  }
  
  // Deactivate the current bypass code
  const deactivateCode = async () => {
    if (!confirm('Are you sure you want to deactivate your bypass code?')) {
      return
    }
    
    try {
      submitting.value = true
      await api.delete('/teacher/bypass-code')
      
      // Clear the current code
      currentBypassCode.value = null
      
      // Show success message (could add a toast notification here)
    } catch (err: any) {
      error.value = 'Failed to deactivate bypass code. Please try again.'
      console.error('Error deactivating bypass code:', err)
    } finally {
      submitting.value = false
    }
  }
  </script>