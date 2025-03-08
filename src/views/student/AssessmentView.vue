<!-- src/views/student/AssessmentView.vue -->
<template>
    <div class="p-6">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading assessment...</p>
      </div>
  
      <!-- Error Alert using BaseAlert -->
      <BaseAlert
        v-if="error"
        v-model="showError"
        variant="error"
        :message="error"
        dismissible
      />
  
      <!-- Content -->
      <div v-if="currentChunk && !isLoading" class="space-y-6">
        <!-- Reading Section -->
        <div class="bg-white shadow rounded-lg">
          <!-- Text Content -->
          <div class="p-6">
            <div class="prose max-w-none">
              {{ currentChunk.content }}
            </div>
          </div>
  
          <!-- Navigation -->
          <div class="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
            <BaseButton
              variant="default"
              size="md"
              :disabled="currentChunk.is_first"
            >
              Previous
            </BaseButton>
  
            <BaseButton
              v-if="currentChunk.has_next"
              variant="primary"
              size="md"
            >
              Next
            </BaseButton>
            <BaseButton
              v-else
              variant="success"
              size="md"
            >
              Complete Reading
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </template>
  
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'

interface Chunk {
  id: string
  content: string
  is_first: boolean
  has_next: boolean
}

const router = useRouter()

// State
const isLoading = ref(false)
const error = ref('')
const showError = ref(false)
const currentChunk = ref<Chunk | null>(null)

onMounted(() => {
  // Fix: Use currentRoute instead of getCurrentRoute
  const routeParams = router.currentRoute.value.params
if (routeParams.initialChunk) {
  try {
    // If it's a stringified JSON object
    currentChunk.value = JSON.parse(routeParams.initialChunk as string)
  } catch {
    // Handle case where it's not valid JSON
    console.error('Invalid initialChunk data')
  }
}
})
</script>