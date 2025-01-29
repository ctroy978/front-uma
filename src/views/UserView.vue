<!-- src/views/UserView.vue -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="sm:flex sm:items-center mb-6">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">User Management</h1>
        <p class="mt-2 text-sm text-gray-700">
          Manage user accounts, roles, and permissions.
        </p>
      </div>
    </div>

    <!-- Filters Component -->
    <UserFilters />

    <!-- User Table Component -->
    <UserTable 
      @edit-role="handleEditRole"
      @toggle-status="handleToggleStatus"
    />

    <!-- Role Edit Modal -->
    <UserRoleModal
      v-if="showRoleModal"
      :show="showRoleModal"
      :user="selectedUser"
      @close="closeRoleModal"
      @update="handleRoleUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import UserFilters from '../components/admin/UserFilters.vue'
import UserTable from '../components/admin/UserTable.vue'
import UserRoleModal from '../components/admin/UserRoleModal.vue'
import { useAdminStore } from '../stores/admin'
import type { User } from '../stores/admin'

// Store
const adminStore = useAdminStore()

// State
const showRoleModal = ref(false)
const selectedUser = ref<User | null>(null)

// Lifecycle
onMounted(async () => {
  try {
    await adminStore.fetchUsers()
  } catch (error) {
    console.error('Failed to fetch users:', error)
  }
})

// Methods
const handleEditRole = (user: User) => {
  selectedUser.value = user
  showRoleModal.value = true
}

const closeRoleModal = () => {
  showRoleModal.value = false
  selectedUser.value = null
}

const handleRoleUpdate = async (updatedUser: User) => {
  await adminStore.fetchUsers()
  closeRoleModal()
}

const handleToggleStatus = async (user: User) => {
  try {
    await adminStore.toggleUserStatus(user.id)
  } catch (error) {
    console.error('Failed to toggle user status:', error)
  }
}
</script>