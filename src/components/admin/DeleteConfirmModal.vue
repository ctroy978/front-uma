<!-- src/components/admin/DeleteConfirmModal.vue -->
<template>
    <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
  
      <!-- Modal -->
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <!-- Close button -->
          <div class="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              class="rounded-md bg-white text-gray-400 hover:text-gray-500"
              @click="handleClose"
            >
              <span class="sr-only">Close</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
  
          <!-- Content -->
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10"
                 :class="user.is_deleted ? 'bg-green-100' : 'bg-red-100'">
              <component 
                :is="user.is_deleted ? Power : UserX"
                :class="user.is_deleted ? 'text-green-600' : 'text-red-600'"
                class="h-6 w-6"
              />
            </div>
            
            <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 class="text-lg font-semibold leading-6 text-gray-900">
                {{ user.is_deleted ? 'Reactivate Account' : 'Deactivate Account' }}
              </h3>
  
              <!-- User Info -->
              <div class="mt-2">
                <p class="text-sm text-gray-600">
                  <span class="font-medium">Username:</span> {{ user.username }}
                </p>
                <p class="text-sm text-gray-600">
                  <span class="font-medium">Email:</span> {{ user.email }}
                </p>
                <p class="text-sm text-gray-600">
                  <span class="font-medium">Current Status:</span>
                  <span :class="user.is_deleted ? 'text-red-600' : 'text-green-600'">
                    {{ user.is_deleted ? 'Deactivated' : 'Active' }}
                  </span>
                </p>
              </div>
  
              <!-- Action Description -->
              <div class="mt-4">
                <p class="text-sm text-gray-500">
                  {{ actionDescription }}
                </p>
              </div>
  
              <!-- Error Message -->
              <div v-if="error" class="mt-2 text-sm text-red-600">
                {{ error }}
              </div>
            </div>
          </div>
  
          <!-- Actions -->
          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              :class="[
                'inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto',
                user.is_deleted 
                  ? 'bg-green-600 hover:bg-green-500' 
                  : 'bg-red-600 hover:bg-red-500',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              ]"
              :disabled="isLoading"
              @click="handleSubmit"
            >
              <svg
                v-if="isLoading"
                class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {{ user.is_deleted ? 'Reactivate Account' : 'Deactivate Account' }}
            </button>
            <button
              type="button"
              class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              @click="handleClose"
              :disabled="isLoading"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import { Power, UserX } from 'lucide-react'
  import { useAdminStore } from '../../stores/admin'
  import type { User } from '../../stores/admin'
  
  // Props
  const props = defineProps<{
    show: boolean
    user: User
  }>()
  
  // Emits
  const emit = defineEmits<{
    close: []
    confirm: [user: User]
  }>()
  
  // Store
  const adminStore = useAdminStore()
  
  // State
  const isLoading = ref(false)
  const error = ref('')
  
  // Computed
  const actionDescription = computed(() => {
    if (props.user.is_deleted) {
      return "This will reactivate the user's account, allowing them to log in again. All their previous data and permissions will be restored."
    } else {
      return "This will deactivate the user's account. They won't be able to log in, but their data will be preserved for future reactivation if needed."
    }
  })
  
  // Methods
  const handleClose = () => {
    if (!isLoading.value) {
      error.value = ''
      emit('close')
    }
  }
  
  const handleSubmit = async () => {
    if (isLoading.value) return
  
    isLoading.value = true
    error.value = ''
  
    try {
      const updatedUser = await adminStore.toggleUserStatus(props.user.id)
      emit('confirm', updatedUser)
      emit('close')
    } catch (err: any) {
      error.value = err.message || 'Failed to update user status'
    } finally {
      isLoading.value = false
    }
  }
  </script>