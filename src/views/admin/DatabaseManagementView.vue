<!-- src/views/admin/DatabaseManagementView.vue -->
<template>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Database Management</h1>
        <p class="mt-2 text-sm text-gray-700">
          Manage database records for troubleshooting and maintenance.
        </p>
      </div>
  
      <!-- Alerts -->
      <BaseAlert
        v-model="alerts.error.show"
        variant="error"
        :title="alerts.error.title"
        dismissible
      >
        {{ alerts.error.message }}
      </BaseAlert>
  
      <BaseAlert
        v-model="alerts.success.show"
        variant="success"
        :title="alerts.success.title"
        dismissible
      >
        {{ alerts.success.message }}
      </BaseAlert>
  
      <!-- Table Selector -->
      <div class="bg-white shadow rounded-lg mb-6 p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Select Table</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="col-span-2">
            <label for="table-select" class="block text-sm font-medium text-gray-700 mb-1">
              Table
            </label>
            <select
              id="table-select"
              v-model="selectedTable"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="loadRecords"
            >
              <option value="">Select a table</option>
              <option v-for="table in tables" :key="table.name" :value="table.name">
                {{ table.display_name }}
              </option>
            </select>
          </div>
  
          <div>
            <label for="include-deleted" class="block text-sm font-medium text-gray-700 mb-1">
              Options
            </label>
            <div class="flex items-center mt-2">
              <input 
                id="include-deleted" 
                type="checkbox" 
                v-model="includeDeleted"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                @change="loadRecords"
              />
              <label for="include-deleted" class="ml-2 block text-sm text-gray-700">
                Include deleted records
              </label>
            </div>
          </div>
        </div>
  
        <!-- Search Box -->
        <div class="mt-4">
          <BaseInput
            name="search"
            label="Search records"
            v-model="searchTerm"
            placeholder="Enter search term"
          >
          </BaseInput>
          <div class="mt-2 flex space-x-2">
            <BaseButton @click="loadRecords" variant="primary" size="sm">
              Search
            </BaseButton>
            <BaseButton @click="clearSearch" variant="default" size="sm">
              Clear
            </BaseButton>
          </div>
        </div>
      </div>
  
      <!-- Records Table -->
      <div v-if="selectedTable" class="bg-white shadow rounded-lg">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium text-gray-900">
              {{ getTableInfo(selectedTable)?.display_name }} Records
            </h2>
            <div class="text-sm text-gray-500">
              Showing {{ records.length }} of {{ totalRecords }} records
            </div>
          </div>
  
          <!-- Loading State -->
          <div v-if="loading" class="py-4 text-center text-gray-500">
            Loading records...
          </div>
  
          <!-- Empty State -->
          <div v-else-if="!records.length" class="py-4 text-center text-gray-500">
            No records found. Try adjusting your search or filters.
          </div>
  
          <!-- Records Table -->
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <!-- Context Information Headers -->
                  <th v-if="selectedTable === 'completions' || selectedTable === 'active_assessments'" 
                      scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                    Student
                  </th>
                  <th v-if="selectedTable === 'completions' || selectedTable === 'active_assessments' || 
                           selectedTable === 'question_cache' || selectedTable === 'simplified_chunks'" 
                      scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                    Text
                  </th>
                  
                  <!-- Dynamic Columns -->
                  <th v-for="column in visibleColumns" :key="column" scope="col" 
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    {{ formatColumnName(column) }}
                  </th>
                  
                  <!-- Status Column -->
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="record in records" :key="record.id" :class="{ 'bg-red-50': record.is_deleted }">
                  <!-- Student Information -->
                  <td v-if="selectedTable === 'completions' || selectedTable === 'active_assessments'" 
                      class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    <div>{{ record.context.student_name || 'Unknown Student' }}</div>
                    <div class="text-xs text-gray-500">{{ record.context.student_email }}</div>
                  </td>
                  
                  <!-- Text Information -->
                  <td v-if="selectedTable === 'completions' || selectedTable === 'active_assessments' || 
                           selectedTable === 'question_cache' || selectedTable === 'simplified_chunks'" 
                      class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    <div>{{ record.context.text_title || 'Unknown Text' }}</div>
                    <div v-if="record.context.text_grade" class="text-xs text-gray-500">
                      Grade {{ record.context.text_grade }}
                    </div>
                  </td>
                  
                  <!-- Dynamic Columns -->
                  <td v-for="column in visibleColumns" :key="`${record.id}-${column}`" 
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {{ formatColumnValue(record.data[column]) }}
                  </td>
                  
                  <!-- Status -->
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <span v-if="record.is_deleted" 
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Deleted
                    </span>
                    <span v-else-if="selectedTable === 'active_assessments' && record.data.completed" 
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                    <span v-else-if="selectedTable === 'active_assessments' && !record.data.is_active" 
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Inactive
                    </span>
                    <span v-else-if="selectedTable === 'completions' && record.data.completed_at" 
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                    <span v-else 
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Active
                    </span>
                  </td>
                  
                  <!-- Actions -->
                  <td class="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <button
                        v-if="record.is_deleted"
                        @click="confirmRestore(record)"
                        class="text-blue-600 hover:text-blue-900"
                        :disabled="isProcessing"
                      >
                        Restore
                      </button>
                      <button
                        v-else
                        @click="confirmDelete(record)"
                        class="text-red-600 hover:text-red-900"
                        :disabled="isProcessing"
                      >
                        Delete
                      </button>
                      <button
                        @click="viewDetails(record)"
                        class="text-blue-600 hover:text-blue-900 ml-2"
                        :disabled="isProcessing"
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <!-- Pagination -->
          <div v-if="totalRecords > pageSize" class="py-3 flex items-center justify-between border-t border-gray-200 mt-4">
            <div class="flex-1 flex justify-between sm:hidden">
              <BaseButton 
                :disabled="currentPage === 0" 
                @click="prevPage" 
                variant="default" 
                size="sm"
              >
                Previous
              </BaseButton>
              <BaseButton 
                :disabled="(currentPage + 1) * pageSize >= totalRecords" 
                @click="nextPage" 
                variant="default" 
                size="sm"
              >
                Next
              </BaseButton>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Showing
                  <span class="font-medium">{{ currentPage * pageSize + 1 }}</span>
                  to
                  <span class="font-medium">{{ Math.min((currentPage + 1) * pageSize, totalRecords) }}</span>
                  of
                  <span class="font-medium">{{ totalRecords }}</span>
                  results
                </p>
              </div>
              <div>
                <nav class="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    @click="prevPage"
                    :disabled="currentPage === 0"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    :class="{ 'opacity-50 cursor-not-allowed': currentPage === 0 }"
                  >
                    <span class="sr-only">Previous</span>
                    <!-- Chevron left -->
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <button
                    @click="nextPage"
                    :disabled="(currentPage + 1) * pageSize >= totalRecords"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    :class="{ 'opacity-50 cursor-not-allowed': (currentPage + 1) * pageSize >= totalRecords }"
                  >
                    <span class="sr-only">Next</span>
                    <!-- Chevron right -->
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Delete Confirmation Dialog -->
      <BaseDialog
        v-model="dialogs.delete.show"
        title="Confirm Deletion"
        variant="danger"
        confirmText="Delete"
        @confirm="executeDelete"
      >
        <p>
          Are you sure you want to delete this record? 
          <span v-if="!dialogs.delete.hardDelete">This will be a soft delete and can be restored later.</span>
          <span v-else class="text-red-600 font-medium">
            This will PERMANENTLY delete the record and CANNOT be undone.
          </span>
        </p>
        
        <div class="mt-3" v-if="dialogs.delete.record">
          <p class="text-sm font-medium">Record details:</p>
          <code class="block bg-gray-100 p-2 mt-1 text-xs rounded overflow-x-auto">
            {{ JSON.stringify(dialogs.delete.record.data, null, 2) }}
          </code>
        </div>
  
        <div class="mt-4 flex items-center" v-if="!dialogs.delete.hardDelete">
          <input 
            id="hard-delete" 
            type="checkbox" 
            v-model="dialogs.delete.hardDelete"
            class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <label for="hard-delete" class="ml-2 block text-sm text-red-700 font-medium">
            Permanently delete (cannot be restored)
          </label>
        </div>
      </BaseDialog>
  
      <!-- Restore Confirmation Dialog -->
      <BaseDialog
        v-model="dialogs.restore.show"
        title="Confirm Restoration"
        confirmText="Restore"
        @confirm="executeRestore"
      >
        <p>Are you sure you want to restore this record?</p>
        
        <div class="mt-3" v-if="dialogs.restore.record">
          <p class="text-sm font-medium">Record details:</p>
          <code class="block bg-gray-100 p-2 mt-1 text-xs rounded overflow-x-auto">
            {{ JSON.stringify(dialogs.restore.record.data, null, 2) }}
          </code>
        </div>
      </BaseDialog>
  
      <!-- Details Dialog -->
      <BaseDialog
        v-model="dialogs.details.show"
        title="Record Details"
        :show-default-footer="false"
        class-name="max-w-2xl"
      >
        <div v-if="dialogs.details.record">
          <!-- Context Header -->
          <div class="bg-gray-50 p-4 rounded-lg mb-4">
            <template v-if="selectedTable === 'completions' || selectedTable === 'active_assessments'">
              <h3 class="font-medium">{{ dialogs.details.record.context.student_name }}</h3>
              <p class="text-sm text-gray-500">{{ dialogs.details.record.context.student_email }}</p>
              <p class="mt-2">
                <span class="font-medium">Text:</span> 
                {{ dialogs.details.record.context.text_title }}
                <span v-if="dialogs.details.record.context.text_grade">
                  (Grade {{ dialogs.details.record.context.text_grade }})
                </span>
              </p>
            </template>
            
            <template v-if="selectedTable === 'question_cache'">
              <h3 class="font-medium">{{ dialogs.details.record.context.text_title || 'Unknown Text' }}</h3>
              <p class="text-sm mt-2" v-if="dialogs.details.record.context.chunk_preview">
                <span class="font-medium">Chunk Preview:</span><br> 
                {{ dialogs.details.record.context.chunk_preview }}
              </p>
            </template>
            
            <template v-if="selectedTable === 'simplified_chunks'">
              <h3 class="font-medium">{{ dialogs.details.record.context.text_title || 'Unknown Text' }}</h3>
              <div class="grid grid-cols-2 gap-4 mt-2">
                <div v-if="dialogs.details.record.context.original_content">
                  <p class="text-sm font-medium">Original Content:</p>
                  <p class="text-sm bg-white p-2 rounded border mt-1">
                    {{ dialogs.details.record.context.original_content }}
                  </p>
                </div>
                <div v-if="dialogs.details.record.data.simplified_content">
                  <p class="text-sm font-medium">Simplified Content:</p>
                  <p class="text-sm bg-white p-2 rounded border mt-1">
                    {{ dialogs.details.record.data.simplified_content && 
                       dialogs.details.record.data.simplified_content.substring(0, 200) + '...' }}
                  </p>
                </div>
              </div>
            </template>
            
            <template v-if="selectedTable === 'completion_questions'">
              <h3 class="font-medium" v-if="dialogs.details.record.context.student_name">
                {{ dialogs.details.record.context.student_name }}
              </h3>
              <p class="mt-2" v-if="dialogs.details.record.context.text_title">
                <span class="font-medium">Text:</span> 
                {{ dialogs.details.record.context.text_title }}
              </p>
            </template>
          </div>
          
          <!-- Full Record Data -->
          <div>
            <h4 class="text-sm font-medium mb-2">Raw Record Data:</h4>
            <div class="bg-gray-100 p-3 rounded-md overflow-x-auto">
              <pre class="text-xs">{{ JSON.stringify(dialogs.details.record.data, null, 2) }}</pre>
            </div>
          </div>
          
          <!-- Custom Actions -->
          <div class="mt-6 flex justify-end space-x-3">
            <BaseButton 
              variant="default" 
              size="sm" 
              @click="dialogs.details.show = false"
            >
              Close
            </BaseButton>
            <BaseButton 
              v-if="!dialogs.details.record.is_deleted"
              variant="danger" 
              size="sm" 
              @click="confirmDeleteFromDetails()"
            >
              Delete Record
            </BaseButton>
            <BaseButton
              v-else
              variant="primary"
              size="sm"
              @click="confirmRestoreFromDetails()"
            >
              Restore Record
            </BaseButton>
          </div>
        </div>
      </BaseDialog>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import api from '@/utils/axios'
  import BaseAlert from '@/components/base/BaseAlert.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseDialog from '@/components/base/BaseDialog.vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  
  // Types
  interface TableInfo {
    name: string
    display_name: string
    description: string
  }
  
  interface RecordData {
    id: string
    data: Record<string, any>
    context: Record<string, any>
    is_deleted?: boolean
  }
  
  // State
  const tables = ref<TableInfo[]>([])
  const selectedTable = ref('')
  const records = ref<RecordData[]>([])
  const totalRecords = ref(0)
  const loading = ref(false)
  const isProcessing = ref(false)
  const searchTerm = ref('')
  const includeDeleted = ref(false)
  const currentPage = ref(0)
  const pageSize = 50
  
  // Alert states
  const alerts = ref({
    error: {
      show: false,
      title: 'Error',
      message: ''
    },
    success: {
      show: false,
      title: 'Success',
      message: ''
    }
  })
  
  // Dialog states
  const dialogs = ref({
    delete: {
      show: false,
      record: null as RecordData | null,
      hardDelete: false
    },
    restore: {
      show: false,
      record: null as RecordData | null
    },
    details: {
      show: false,
      record: null as RecordData | null
    }
  })
  
  // Compute visible columns based on table type
  const visibleColumns = computed(() => {
    if (!records.value.length) return [];
    
    const sample = records.value[0].data;
    let columns = [];
    
    // Table-specific columns
    if (selectedTable.value === 'active_assessments') {
      // Show the most relevant columns for active assessments
      columns = ['current_category', 'current_difficulty', 'consecutive_correct', 'consecutive_incorrect'];
    } 
    else if (selectedTable.value === 'completions') {
      columns = ['test_status', 'overall_score', 'total_questions', 'correct_answers'];
    }
    else if (selectedTable.value === 'question_cache') {
      columns = ['question_category', 'grade_level', 'access_count'];
    }
    else if (selectedTable.value === 'simplified_chunks') {
      columns = ['original_grade_level', 'target_grade_level', 'access_count'];
    }
    else if (selectedTable.value === 'completion_questions') {
      columns = ['category', 'difficulty', 'is_correct', 'is_answered'];
    }
    else {
      // Default column selection for other tables
      columns = Object.keys(sample).filter(col => 
        col !== 'id' && 
        !col.includes('_id') && 
        col !== 'is_deleted' &&
        col !== 'created_at' &&
        col !== 'updated_at' &&
        // Skip content fields that would be too long
        col !== 'content' &&
        col !== 'simplified_content' &&
        col !== 'question_text' &&
        col !== 'student_answer'
      ).slice(0, 5);
    }
    
    return columns;
  });
  
  // Fetch available tables on mount
  onMounted(async () => {
    try {
      loading.value = true
      const response = await api.get('/admin/database/tables')
      tables.value = response.data
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Failed to load tables')
    } finally {
      loading.value = false
    }
  })
  
  // Load records for selected table
  const loadRecords = async () => {
    if (!selectedTable.value) return
    
    try {
      loading.value = true
      currentPage.value = 0 // Reset to first page
      
      const params = {
        search: searchTerm.value || undefined,
        include_deleted: includeDeleted.value,
        limit: pageSize,
        offset: 0
      }
      
      const response = await api.get(`/admin/database/${selectedTable.value}`, { params })
      records.value = response.data.records
      totalRecords.value = response.data.total
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Failed to load records')
      records.value = []
      totalRecords.value = 0
    } finally {
      loading.value = false
    }
  }
  
  // Pagination handlers
  const nextPage = async () => {
    if ((currentPage.value + 1) * pageSize >= totalRecords.value) return
    
    currentPage.value++
    await fetchPage()
  }
  
  const prevPage = async () => {
    if (currentPage.value === 0) return
    
    currentPage.value--
    await fetchPage()
  }
  
  const fetchPage = async () => {
    try {
      loading.value = true
      
      const params = {
        search: searchTerm.value || undefined,
        include_deleted: includeDeleted.value,
        limit: pageSize,
        offset: currentPage.value * pageSize
      }
      
      const response = await api.get(`/admin/database/${selectedTable.value}`, { params })
      records.value = response.data.records
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Failed to load records')
    } finally {
      loading.value = false
    }
  }
  
  // Clear search
  const clearSearch = () => {
    searchTerm.value = ''
    loadRecords()
  }
  
  // Confirmation handlers
  const confirmDelete = (record: RecordData) => {
    dialogs.value.delete.record = record
    dialogs.value.delete.hardDelete = false
    dialogs.value.delete.show = true
  }
  
  const confirmRestore = (record: RecordData) => {
    dialogs.value.restore.record = record
    dialogs.value.restore.show = true
  }
  
  const viewDetails = (record: RecordData) => {
    dialogs.value.details.record = record
    dialogs.value.details.show = true
  }
  
  const confirmDeleteFromDetails = () => {
    const record = dialogs.value.details.record
    if (record) {
      dialogs.value.details.show = false
      setTimeout(() => {
        confirmDelete(record)
      }, 300) // Short delay for better UX
    }
  }
  
  const confirmRestoreFromDetails = () => {
    const record = dialogs.value.details.record
    if (record) {
      dialogs.value.details.show = false
      setTimeout(() => {
        confirmRestore(record)
      }, 300) // Short delay for better UX
    }
  }
  
  // Action handlers
  const executeDelete = async () => {
    const record = dialogs.value.delete.record
    if (!record) return
    
    try {
      isProcessing.value = true
      
      const url = `/admin/database/${selectedTable.value}/${record.id}`
      const params = { hard_delete: dialogs.value.delete.hardDelete }
      
      await api.delete(url, { params })
      
      // Update local state
      if (dialogs.value.delete.hardDelete) {
        records.value = records.value.filter(r => r.id !== record.id)
        totalRecords.value--
      } else {
        // Mark as deleted for soft delete
        const index = records.value.findIndex(r => r.id === record.id)
        if (index >= 0) {
          records.value[index].is_deleted = true
        }
      }
      
      showSuccess(`Record successfully ${dialogs.value.delete.hardDelete ? 'permanently deleted' : 'soft-deleted'}`)
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Failed to delete record')
    } finally {
      isProcessing.value = false
      dialogs.value.delete.show = false
    }
  }
  
  const executeRestore = async () => {
    const record = dialogs.value.restore.record
    if (!record) return
    
    try {
      isProcessing.value = true
      
      await api.put(`/admin/database/${selectedTable.value}/${record.id}/restore`)
      
      // Update local state
      const index = records.value.findIndex(r => r.id === record.id)
      if (index >= 0) {
        records.value[index].is_deleted = false
      }
      
      showSuccess('Record successfully restored')
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Failed to restore record')
    } finally {
      isProcessing.value = false
      dialogs.value.restore.show = false
    }
  }
  
  // Helper functions
  const getTableInfo = (tableName: string): TableInfo | undefined => {
    return tables.value.find(t => t.name === tableName)
  }
  
  const formatColumnName = (column: string): string => {
    return column
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
  }
  
  const formatColumnValue = (value: any): string => {
    if (value === null || value === undefined) return '—'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (value instanceof Date || (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/))) {
      // Format dates nicely
      try {
        const date = new Date(value)
        return date.toLocaleString()
      } catch (e) {
        return String(value)
      }
    }
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }
  
  const showError = (message: string) => {
    alerts.value.error.message = message
    alerts.value.error.show = true
    setTimeout(() => {
      alerts.value.error.show = false
    }, 5000)
  }
  
  const showSuccess = (message: string) => {
    alerts.value.success.message = message
    alerts.value.success.show = true
    setTimeout(() => {
      alerts.value.success.show = false
    }, 3000)
  }
  </script>