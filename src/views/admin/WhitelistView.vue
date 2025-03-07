<!-- src/views/admin/WhitelistView.vue -->
<template>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Email Whitelist Management</h1>
        <p class="mt-2 text-sm text-gray-700">
          Control which email domains and addresses can register for accounts.
        </p>
      </div>
  
      <!-- Error/Success Alerts -->
      <div v-if="error" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ error }}
      </div>
      <div v-if="successMessage" class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
        {{ successMessage }}
      </div>
  
      <!-- Add New Entry Form -->
      <div class="bg-white shadow rounded-lg mb-6">
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Add New Whitelist Entry</h2>
          <form @submit.prevent="addWhitelistEntry" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <!-- Value Input -->
              <div class="sm:col-span-2">
                <label for="value" class="block text-sm font-medium text-gray-700">
                  Domain or Email
                </label>
                <input
                  type="text"
                  id="value"
                  v-model="newEntry.value"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="example.com or user@example.com"
                  required
                />
              </div>
  
              <!-- Type Selection -->
              <div>
                <label for="type" class="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  id="type"
                  v-model="newEntry.type"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                >
                  <option value="domain">Domain</option>
                  <option value="email">Email</option>
                </select>
              </div>
            </div>
  
            <!-- Description Field -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <input
                type="text"
                id="description"
                v-model="newEntry.description"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="School district domain"
              />
            </div>
  
            <!-- Submit Button -->
            <div>
              <button
                type="submit"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                :disabled="isLoading"
              >
                <span v-if="isLoading">Adding...</span>
                <span v-else>Add to Whitelist</span>
              </button>
            </div>
          </form>
        </div>
      </div>
  
      <!-- Whitelist Entries Table -->
      <div class="bg-white shadow rounded-lg">
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Current Whitelist Entries</h2>
  
          <!-- Loading State -->
          <div v-if="isLoading" class="py-4 text-center text-gray-500">
            Loading whitelist entries...
          </div>
  
          <!-- Empty State -->
          <div v-else-if="!whitelist.length" class="py-4 text-center text-gray-500">
            No whitelist entries found. Add your first entry above.
          </div>
  
          <!-- Entries Table -->
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Value</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="entry in whitelist" :key="entry.id">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    {{ entry.value }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                    {{ entry.type }}
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ entry.description || '—' }}
                  </td>
                  <td class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                    <button
                      @click="removeEntry(entry.id)"
                      class="text-red-600 hover:text-red-900"
                      :disabled="isRemoving === entry.id"
                    >
                      {{ isRemoving === entry.id ? 'Removing...' : 'Remove' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import api from '@/utils/axios'
  
  // Types
  interface WhitelistEntry {
    id: string
    value: string
    type: 'domain' | 'email'
    description?: string
  }
  
  // State
  const whitelist = ref<WhitelistEntry[]>([])
  const isLoading = ref(false)
  const isRemoving = ref<string | null>(null)
  const error = ref('')
  const successMessage = ref('')
  
  const newEntry = ref({
    value: '',
    type: 'domain' as 'domain' | 'email',
    description: ''
  })
  
  // Fetch whitelist entries
  const fetchWhitelist = async () => {
    error.value = ''
    isLoading.value = true
    
    try {
      const response = await api.get('/admin/whitelist')
      whitelist.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to load whitelist entries'
      console.error('Error fetching whitelist:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  // Add new whitelist entry
  const addWhitelistEntry = async () => {
    error.value = ''
    successMessage.value = ''
    isLoading.value = true
    
    try {
      const response = await api.post('/admin/whitelist', newEntry.value)
      
      // Add to the list if it's not already there
      const exists = whitelist.value.find(entry => entry.id === response.data.id)
      if (!exists) {
        whitelist.value.push(response.data)
      }
      
      // Clear form
      newEntry.value = {
        value: '',
        type: 'domain',
        description: ''
      }
      
      successMessage.value = 'Whitelist entry added successfully'
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to add whitelist entry'
      console.error('Error adding whitelist entry:', err)
    } finally {
      isLoading.value = false
      
      // Clear success message after a few seconds
      if (successMessage.value) {
        setTimeout(() => {
          successMessage.value = ''
        }, 3000)
      }
    }
  }
  
  // Remove whitelist entry
  const removeEntry = async (id: string) => {
    error.value = ''
    successMessage.value = ''
    isRemoving.value = id
    
    try {
      await api.delete(`/admin/whitelist/${id}`)
      whitelist.value = whitelist.value.filter(entry => entry.id !== id)
      successMessage.value = 'Whitelist entry removed successfully'
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to remove whitelist entry'
      console.error('Error removing whitelist entry:', err)
    } finally {
      isRemoving.value = null
      
      // Clear success message after a few seconds
      if (successMessage.value) {
        setTimeout(() => {
          successMessage.value = ''
        }, 3000)
      }
    }
  }
  
  // Load data on component mount
  onMounted(() => {
    fetchWhitelist()
  })
  </script>