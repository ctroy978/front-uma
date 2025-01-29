<!-- components/admin/UserTable.vue -->
<template>
    <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table class="min-w-full divide-y divide-gray-300">
        <!-- Table Header -->
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="column in columns"
              :key="column.field"
              scope="col"
              class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
            >
              <div 
                class="group inline-flex items-center cursor-pointer"
                @click="handleSort(column.field)"
              >
                {{ column.label }}
                <!-- Sort Icons -->
                <span 
                  v-if="column.sortable"
                  class="ml-2 flex-none rounded text-gray-400"
                >
                  <template v-if="sort.field === column.field">
                    <ChevronUp v-if="sort.direction === 'asc'" class="h-4 w-4" />
                    <ChevronDown v-else class="h-4 w-4" />
                  </template>
                  <ChevronsUpDown v-else class="h-4 w-4" />
                </span>
              </div>
            </th>
            <th scope="col" class="relative py-3.5 pl-3 pr-4">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
  
        <!-- Table Body -->
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-if="isLoading" class="animate-pulse">
            <td 
              :colspan="columns.length + 1" 
              class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center"
            >
              Loading users...
            </td>
          </tr>
          
          <tr v-else-if="error" class="bg-red-50">
            <td 
              :colspan="columns.length + 1" 
              class="whitespace-nowrap px-3 py-4 text-sm text-red-500 text-center"
            >
              {{ error }}
            </td>
          </tr>
  
          <tr 
            v-else-if="filteredUsers.length === 0" 
            class="bg-gray-50"
          >
            <td 
              :colspan="columns.length + 1" 
              class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center"
            >
              No users found
            </td>
          </tr>
  
          <tr 
            v-for="user in filteredUsers" 
            :key="user.id"
            :class="{'bg-blue-50': user.id === currentUserId}"
          >
            <!-- User Data -->
            <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
              <div class="font-medium text-gray-900">{{ user.username }}</div>
              <div class="text-gray-500">{{ user.email }}</div>
            </td>
            
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
              {{ user.full_name }}
            </td>
            
            <td class="whitespace-nowrap px-3 py-4 text-sm">
              <span 
                class="inline-flex rounded-full px-2 text-xs font-semibold capitalize"
                :class="getRoleBadgeClass(user.role_name)"
              >
                {{ user.role_name.toLowerCase() }}
              </span>
            </td>
            
            <td class="whitespace-nowrap px-3 py-4 text-sm">
              <span 
                class="inline-flex rounded-full px-2 text-xs font-semibold"
                :class="user.is_deleted ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'"
              >
                {{ user.is_deleted ? 'Deleted' : 'Active' }}
              </span>
            </td>
            
            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
              {{ formatDate(user.created_at) }}
            </td>
  
            <!-- Actions -->
            <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
              <div class="flex items-center justify-end gap-2">
                <button
                  @click="$emit('edit-role', user)"
                  class="text-blue-600 hover:text-blue-900"
                  :disabled="user.id === currentUserId"
                  :class="{ 'opacity-50 cursor-not-allowed': user.id === currentUserId }"
                >
                  Edit Role
                </button>
                <button
                  @click="$emit('toggle-status', user)"
                  class="text-red-600 hover:text-red-900"
                  :disabled="user.id === currentUserId"
                  :class="{ 'opacity-50 cursor-not-allowed': user.id === currentUserId }"
                >
                  {{ user.is_deleted ? 'Restore' : 'Delete' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
  import { useAdminStore } from '@/stores/admin'
  import { useAuthStore } from '@/stores/auth'
  import type { User } from '@/stores/admin'
  
  // Stores
  const adminStore = useAdminStore()
  const authStore = useAuthStore()
  
  // Props & Emits
  defineEmits<{
    'edit-role': [user: User]
    'toggle-status': [user: User]
  }>()
  
  // Computed
  const currentUserId = computed(() => authStore.currentUser?.id)
  const filteredUsers = computed(() => adminStore.filteredUsers)
  const isLoading = computed(() => adminStore.isLoading)
  const error = computed(() => adminStore.error)
  const sort = computed(() => adminStore.sort)
  
  // Column Definitions
  const columns = [
    { field: 'username' as const, label: 'User', sortable: true },
    { field: 'full_name' as const, label: 'Full Name', sortable: true },
    { field: 'role_name' as const, label: 'Role', sortable: true },
    { field: 'is_deleted' as const, label: 'Status', sortable: true },
    { field: 'created_at' as const, label: 'Created', sortable: true },
  ] as const
  
  // Methods
  const handleSort = (field: keyof User) => {
    adminStore.setSort(field)
  }
  
  const getRoleBadgeClass = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700'
      case 'TEACHER':
        return 'bg-blue-100 text-blue-700'
      case 'STUDENT':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  </script>