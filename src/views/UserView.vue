<!-- src/views/UserView.vue -->
<template>
    <div class="w-full p-6">
      <!-- Header Section -->
      <div class="bg-white shadow rounded-lg mb-6">
        <div class="px-6 py-4">
          <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
          <p class="mt-1 text-sm text-gray-600">
            Manage user roles and account status
          </p>
        </div>
      </div>
  
      <!-- Alerts -->
      <BaseAlert
        v-if="error"
        v-model="showError"
        variant="error"
        :message="error"
        dismissible
        class="mb-4"
      />
  
      <BaseAlert
        v-if="successMessage"
        v-model="showSuccess"
        variant="success"
        :message="successMessage"
        dismissible
        class="mb-4"
      />
  
      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white shadow rounded-lg p-4">
        <div class="animate-pulse flex space-x-4">
          <div class="flex-1 space-y-4 py-1">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="space-y-2">
              <div class="h-4 bg-gray-200 rounded"></div>
              <div class="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Users Table -->
      <div v-else class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                <div class="text-sm text-gray-500">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="getRoleBadgeClass(user.role_name)">
                  {{ user.role_name }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="user.is_deleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'">
                  {{ user.is_deleted ? 'Deleted' : 'Active' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button 
                  @click="handleEditRole(user)"
                  class="text-indigo-600 hover:text-indigo-900 mr-4"
                  :disabled="user.id === currentUserId"
                >
                  Edit Role
                </button>
                <button 
                  @click="handleToggleStatus(user)"
                  class="text-red-600 hover:text-red-900"
                  :disabled="user.id === currentUserId"
                >
                  {{ user.is_deleted ? 'Restore' : 'Delete' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Role Modal -->
      <UserRoleModal
        v-if="selectedUser"
        :show="isRoleModalOpen"
        :user="selectedUser"
        @close="closeRoleModal"
        @update="handleRoleUpdate"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useAdminStore } from '../stores/admin'
  import { useAuthStore } from '../stores/auth'
  import UserRoleModal from '../components/admin/UserRoleModal.vue'
  import BaseAlert from '../components/base/BaseAlert.vue'
  import type { User } from '../stores/admin'
  
  // Store initialization
  const adminStore = useAdminStore()
  const authStore = useAuthStore()
  
  // State
  const isRoleModalOpen = ref(false)
  const selectedUser = ref<User | null>(null)
  const showError = ref(false)
  const showSuccess = ref(false)
  const successMessage = ref('')
  
  // Computed
  const currentUserId = computed(() => authStore.currentUser?.id)
  const users = computed(() => adminStore.filteredUsers)
  const isLoading = computed(() => adminStore.isLoading)
  const error = computed(() => adminStore.error)
  
  // Methods
  const fetchUsers = async () => {
    try {
      await adminStore.fetchUsers()
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }
  
  const handleEditRole = (user: User) => {
    if (user.id === currentUserId.value) return
    selectedUser.value = user
    isRoleModalOpen.value = true
  }
  
  const closeRoleModal = () => {
    isRoleModalOpen.value = false
    selectedUser.value = null
  }
  
  const handleRoleUpdate = async (updatedUser: User) => {
    successMessage.value = 'User role updated successfully'
    showSuccess.value = true
    closeRoleModal()
  
    // Reset success message after delay
    setTimeout(() => {
      successMessage.value = ''
      showSuccess.value = false
    }, 3000)
  }
  
  const handleToggleStatus = async (user: User) => {
    if (user.id === currentUserId.value) return
    
    try {
      await adminStore.toggleUserStatus(user.id)
      successMessage.value = `User ${user.is_deleted ? 'restored' : 'deleted'} successfully`
      showSuccess.value = true
      
      setTimeout(() => {
        successMessage.value = ''
        showSuccess.value = false
      }, 3000)
    } catch (err) {
      console.error('Error toggling user status:', err)
    }
  }
  
  const getRoleBadgeClass = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800'
      case 'TEACHER':
        return 'bg-blue-100 text-blue-800'
      case 'STUDENT':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Lifecycle
  onMounted(() => {
    fetchUsers()
  })
  </script>