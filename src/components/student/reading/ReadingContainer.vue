<!-- src/components/student/reading/ReadingContainer.vue -->
<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Top Navigation Bar -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Back Button -->
          <button 
            class="flex items-center text-gray-500 hover:text-gray-700"
            @click="handleBack"
          >
            <ArrowLeft class="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex gap-8">
        <!-- Reading Section -->
        <div class="w-3/5">
          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p class="mt-4 text-gray-600">Loading content...</p>
          </div>

          <!-- Error State -->
          <BaseAlert
            v-if="error"
            v-model="showError"
            variant="error"
            :message="error"
            dismissible
          />

          <!-- Text Card -->
          <div v-if="currentChunk && !isLoading" class="bg-white shadow rounded-lg">
            <!-- Title -->
            <div class="px-6 pt-6 border-b border-gray-200">
              <h1 class="text-2xl font-bold text-gray-900 pb-4">{{ readingStore.textTitle }}</h1>
            </div>
            
            <!-- Content -->
            <div class="p-6">
              <div class="prose prose-lg max-w-none">
                <div class="whitespace-pre-wrap break-words font-normal text-gray-900 text-xl leading-relaxed">
                  {{ currentChunk.content }}
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div v-if="currentChunk && !isLoading" class="bg-white shadow rounded-lg p-6">
            <div class="flex justify-between items-center">
              <BaseButton
                variant="default"
                :disabled="!canGoBack"
                @click="handleBack"
              >
                Previous
              </BaseButton>
              
              <BaseButton
                v-if="currentChunk.has_next"
                variant="primary"
                :loading="isLoading"
                @click="handleNext"
              >
                Next
              </BaseButton>
              <BaseButton
                v-else
                variant="success"
                @click="handleComplete"
              >
                Complete Reading
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Right Side Space -->
        <div class="w-2/5">
          <!-- Reserved for future features -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ArrowLeft } from 'lucide-vue-next'
import { useReadingStore } from '@/stores/reading'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const readingStore = useReadingStore()

const showError = ref(false)
const canGoBack = ref(false) // This will be implemented when we add previous functionality

// Using storeToRefs to maintain reactivity
const { currentChunk, isLoading, error } = storeToRefs(readingStore)

// Methods
const handleNext = async () => {
  try {
    await readingStore.getNextChunk()
  } catch (err) {
    showError.value = true
  }
}

const handleBack = () => {
  // For now, just return to dashboard
  router.push({ name: 'student-dashboard' })
}

const handleComplete = () => {
  // Will implement completion logic later
  router.push({ name: 'student-dashboard' })
}

// Lifecycle hooks
onMounted(async () => {
  const textId = route.params.textId as string
  try {
    await readingStore.startReading(textId)
  } catch (err) {
    showError.value = true
  }
})

onUnmounted(() => {
  readingStore.resetState()
})
</script>