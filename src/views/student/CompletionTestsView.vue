<!-- src/views/student/CompletionTestsView.vue -->
<template>
    <div class="p-6">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading completion tests...</p>
      </div>
  
      <!-- Error Alert -->
      <BaseAlert
        v-if="error"
        v-model="showError"
        variant="error"
        :message="error"
        dismissible
      />
  
      <!-- Content -->
      <div v-if="!isLoading" class="space-y-6">
        <!-- Header Section -->
        <div class="sm:flex sm:items-center">
          <div class="sm:flex-auto">
            <h1 class="text-xl font-semibold text-gray-900">Available Completion Tests</h1>
            <p class="mt-2 text-sm text-gray-700">
              Complete your reading assessments within 14 days after finishing a reading assignment.
            </p>
          </div>
        </div>
  
        <!-- Tests Grid -->
        <div v-if="hasCompletions" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="test in sortedCompletions"
            :key="test.id"
            class="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 truncate">{{ test.text_title }}</h3>
              
              <!-- Status Badge -->
              <div class="mt-2">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusClasses(test.test_status)"
                >
                  {{ formatStatus(test.test_status) }}
                </span>
              </div>
  
              <!-- Time Information -->
              <div class="mt-4 space-y-1">
                <p class="text-sm text-gray-500">
                  Opened: {{ formatDate(test.triggered_at) }}
                </p>
                <p class="text-sm"
                  :class="getDaysRemainingClasses(test.days_remaining)"
                >
                  {{ getDaysRemainingText(test.days_remaining) }}
                  <div v-if="test.test_status === 'in_progress'" class="mt-1 text-xs text-orange-600">
                    Note: Test will restart if you've left it unfinished.
                  </div>
                </p>
              </div>
  
              <!-- Action Button -->
              <div class="mt-4">
                <BaseButton
                  variant="primary"
                  :disabled="test.days_remaining <= 0"
                  @click="startTest(test)"
                >
                  Start Test
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Empty State -->
        <div
          v-else
          class="text-center py-12 bg-white rounded-lg shadow"
        >
          <ClipboardCheck class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No completion tests available</h3>
          <p class="mt-1 text-sm text-gray-500">
            Completion tests will appear here after finishing reading assessments.
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ClipboardCheck } from 'lucide-vue-next'
  import { useCompletionStore } from '@/stores/completion'
  import BaseAlert from '@/components/base/BaseAlert.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  
  const router = useRouter()
  const completionStore = useCompletionStore()
  
  // State
  const showError = ref(false)
  
  // Computed
  const isLoading = computed(() => completionStore.isLoading)
  const error = computed(() => completionStore.error)
  const hasCompletions = computed(() => completionStore.hasAvailableCompletions)
  const sortedCompletions = computed(() => completionStore.sortedByDate)
  
  // Methods
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }
  
  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getDaysRemainingText = (days: number) => {
    if (days <= 0) return 'Expired'
    return `${days} day${days === 1 ? '' : 's'} remaining`
  }
  
  const getDaysRemainingClasses = (days: number) => {
    if (days <= 3) return 'text-red-600 font-medium'
    if (days <= 7) return 'text-yellow-600'
    return 'text-gray-600'
  }
  
  const startTest = async (test: any) => {
    try {
      await completionStore.startCompletionTest(test.id)
      // Navigate to test view (route to be added)
      await router.push({
        name: 'completion-test',
        params: { id: test.id }
      })
    } catch (error) {
      showError.value = true
    }
  }
  
  // Lifecycle
  onMounted(async () => {
    try {
      await completionStore.fetchAvailableCompletions()
    } catch (error) {
      showError.value = true
    }
  })
  </script>