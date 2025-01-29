// stores/admin.ts
import { defineStore } from 'pinia'
import api from '../utils/axios'

export interface User {
  id: string
  username: string
  email: string
  full_name: string
  role_name: string
  is_deleted: boolean
  created_at: string
  updated_at: string
}

interface SortField {
  field: keyof User | null
  direction: 'asc' | 'desc'
}

interface AdminState {
  users: User[]
  selectedUser: User | null
  isLoading: boolean
  error: string | null
  filters: {
    role: string | null
    status: 'all' | 'active' | 'deleted'
    search: string
  }
  sort: SortField
}

export const useAdminStore = defineStore('admin', {
  state: (): AdminState => ({
    users: [],
    selectedUser: null,
    isLoading: false,
    error: null,
    filters: {
      role: null,
      status: 'all',
      search: ''
    },
    sort: {
      field: null,
      direction: 'asc'
    }
  }),

  getters: {
    // Get filtered and sorted users
    filteredUsers: (state): User[] => {
      let filtered = [...state.users]

      // Apply role filter
      if (state.filters.role) {
        filtered = filtered.filter(user => user.role_name === state.filters.role)
      }

      // Apply status filter
      if (state.filters.status !== 'all') {
        filtered = filtered.filter(user => {
          if (state.filters.status === 'active') return !user.is_deleted
          return user.is_deleted
        })
      }

      // Apply search filter
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase()
        filtered = filtered.filter(user =>
          user.username.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.full_name.toLowerCase().includes(searchLower)
        )
      }

      // Apply sorting
      if (state.sort.field !== null) {
        filtered.sort((a, b) => {
          const aValue = a[state.sort.field as keyof User]
          const bValue = b[state.sort.field as keyof User]
          const modifier = state.sort.direction === 'asc' ? 1 : -1

          if (aValue < bValue) return -1 * modifier
          if (aValue > bValue) return 1 * modifier
          return 0
        })
      }

      return filtered
    }
  },

  actions: {
    // Fetch all users
    async fetchUsers() {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await api.get<User[]>('/admin/users')
        this.users = response.data
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to fetch users'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Update user role
    async updateUserRole(userId: string, newRole: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.put<User>(`/admin/users/${userId}/role`, {
          role_name: newRole
        })

        // Update user in the local state
        const index = this.users.findIndex(u => u.id === userId)
        if (index !== -1) {
          this.users[index] = response.data
        }

        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to update user role'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Toggle user deleted status
    async toggleUserStatus(userId: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.put<User>(`/admin/users/${userId}/toggle-delete`)

        // Update user in the local state
        const index = this.users.findIndex(u => u.id === userId)
        if (index !== -1) {
          this.users[index] = response.data
        }

        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to toggle user status'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Update filters
    setFilters(newFilters: Partial<AdminState['filters']>) {
      this.filters = {
        ...this.filters,
        ...newFilters
      }
    },

    // Update sort
    setSort(field: keyof User) {
      if (this.sort.field === field) {
        // Toggle direction if same field
        this.sort.direction = this.sort.direction === 'asc' ? 'desc' : 'asc'
      } else {
        // New field, set to ascending
        this.sort.field = field
        this.sort.direction = 'asc'
      }
    },

    // Select a user for modals/actions
    selectUser(user: User | null) {
      this.selectedUser = user
    },

    // Reset store state
    resetState() {
      this.users = []
      this.selectedUser = null
      this.isLoading = false
      this.error = null
      this.filters = {
        role: null,
        status: 'all',
        search: ''
      }
      this.sort = {
        field: null,
        direction: 'asc'
      }
    }
  }
})