<!-- src/components/admin/UserRoleModal.vue -->
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
            <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 class="text-lg font-semibold leading-6 text-gray-900">
                Change User Role
              </h3>
              
              <div class="mt-4">
                <!-- User Info -->
                <div class="mb-4 text-sm text-gray-600">
                  <p><span class="font-medium">Username:</span> {{ user?.username }}</p>
                  <p><span class="font-medium">Current Role:</span> {{ user?.role_name }}</p>
                </div>
  
                <!-- Role Selection -->
                <div class="mt-4">
                  <label for="role" class="block text-sm font-medium text-gray-700">New Role</label>
                  <select
                    id="role"
                    v-model="selectedRole"
                    class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    :disabled="isLoading"
                  >
                    <option v-for="role in availableRoles" :key="role" :value="role">
                      {{ role }}
                    </option>
                  </select>
                </div>
  
                <!-- Error Message -->
                <div v-if="error" class="mt-2 text-sm text-red-600">
                  {{ error }}
                </div>
              </div>
            </div>
          </div>
  
          <!-- Actions -->
          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isLoading || !hasChanged"
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
              Save Changes
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
  import { ref, computed, watch } from 'vue'
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
    update: [user: User]
  }>()
  
  // Store
  const adminStore = useAdminStore()
  
  // State
  const selectedRole = ref('')
  const isLoading = ref(false)
  const error = ref('')
  
  // Available roles (excluding current role)
  const availableRoles = ['STUDENT', 'TEACHER', 'ADMIN']
  
  // Reset state when modal opens
  watch(() => props.show, (newVal) => {
    if (newVal) {
      selectedRole.value = props.user.role_name
      error.value = ''
    }
  })
  
  // Computed
  const hasChanged = computed(() => {
    return selectedRole.value !== props.user.role_name
  })
  
  // Methods
  const handleClose = () => {
    if (!isLoading.value) {
      emit('close')
    }
  }
  
  const handleSubmit = async () => {
    if (!hasChanged.value || isLoading.value) return
  
    isLoading.value = true
    error.value = ''
  
    try {
      const updatedUser = await adminStore.updateUserRole(props.user.id, selectedRole.value)
      emit('update', updatedUser)
      emit('close')
    } catch (err: any) {
      error.value = err.message || 'Failed to update role'
    } finally {
      isLoading.value = false
    }
  }
  </script>