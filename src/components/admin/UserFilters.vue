<!-- src/components/admin/UserFilters.vue -->
<template>
  <div class="bg-white shadow rounded-lg p-4 mb-6">
    <div class="space-y-4 sm:flex sm:space-x-4 sm:space-y-0">
      <!-- Role Filter -->
      <div class="w-full sm:w-1/4">
        <label for="role-filter" class="block text-sm font-medium text-gray-700">Role</label>
        <select
          id="role-filter"
          v-model="localFilters.role"
          class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          @change="handleRoleChange"
        >
          <option value="">All Roles</option>
          <option v-for="role in availableRoles" :key="role" :value="role">
            {{ role }}
          </option>
        </select>
      </div>

      <!-- Status Filter -->
      <div class="w-full sm:w-1/4">
        <label for="status-filter" class="block text-sm font-medium text-gray-700">Status</label>
        <select
          id="status-filter"
          v-model="localFilters.status"
          class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          @change="handleStatusChange"
        >
          <option value="all">All Status</option>
          <option value="active">Active Users</option>
          <option value="deleted">Deactivated Users</option>
        </select>
      </div>

      <!-- Search Input -->
      <div class="w-full sm:w-1/2">
        <label for="search-filter" class="block text-sm font-medium text-gray-700">Search Users</label>
        <div class="mt-1 relative rounded-md shadow-sm">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <LucideSearch class="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="search-filter"
            v-model="localFilters.search"
            class="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Search by username, email, or name"
            @input="handleSearchInput"
          />
          <button
            v-if="localFilters.search"
            type="button"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
            @click="clearSearch"
          >
            <LucideX class="h-5 w-5 text-gray-400 hover:text-gray-500" />
          </button>
        </div>
      </div>
    </div>

    <!-- Active Filters Display -->
    <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
      <div
        v-if="localFilters.role"
        class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
      >
        Role: {{ localFilters.role }}
        <button
          type="button"
          class="ml-1 hover:text-blue-900"
          @click="clearRoleFilter"
        >
          <LucideX class="h-4 w-4" />
        </button>
      </div>

      <div
        v-if="localFilters.status !== 'all'"
        class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-green-100 text-green-700"
      >
        Status: {{ localFilters.status === 'active' ? 'Active' : 'Deactivated' }}
        <button
          type="button"
          class="ml-1 hover:text-green-900"
          @click="clearStatusFilter"
        >
          <LucideX class="h-4 w-4" />
        </button>
      </div>

      <button
        v-if="hasActiveFilters"
        type="button"
        class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
        @click="clearAllFilters"
      >
        Clear all filters
        <LucideXCircle class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search as LucideSearch, X as LucideX, XCircle as LucideXCircle } from 'lucide-vue-next'
import { useAdminStore } from '../../stores/admin'

// Store
const adminStore = useAdminStore()

// Available roles
const availableRoles = ['STUDENT', 'TEACHER', 'ADMIN']

// Local state that mirrors store filters
const localFilters = ref({
  role: adminStore.$state.filters.role,
  status: adminStore.$state.filters.status,
  search: adminStore.$state.filters.search
})

// Computed
const hasActiveFilters = computed(() => {
  return localFilters.value.role || 
         localFilters.value.status !== 'all' || 
         localFilters.value.search.length > 0
})

// Methods
const handleRoleChange = () => {
  adminStore.setFilters({ role: localFilters.value.role })
}

const handleStatusChange = () => {
  adminStore.setFilters({ status: localFilters.value.status })
}

const handleSearchInput = () => {
  adminStore.setFilters({ search: localFilters.value.search })
}

const clearSearch = () => {
  localFilters.value.search = ''
  adminStore.setFilters({ search: '' })
}

const clearRoleFilter = () => {
  localFilters.value.role = null
  adminStore.setFilters({ role: null })
}

const clearStatusFilter = () => {
  localFilters.value.status = 'all'
  adminStore.setFilters({ status: 'all' })
}

const clearAllFilters = () => {
  localFilters.value = {
    role: null,
    status: 'all',
    search: ''
  }
  adminStore.setFilters(localFilters.value)
}
</script>