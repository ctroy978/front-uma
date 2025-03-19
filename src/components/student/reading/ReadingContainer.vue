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
            :message="error || ''"
            dismissible
          />

          <!-- Text Card -->
          <div v-if="currentChunk && !isLoading" class="bg-white shadow rounded-lg">
            <!-- Title -->
            <div class="px-6 pt-6 border-b border-gray-200">
              <h1 class="text-2xl font-bold text-gray-900 pb-4">{{ textTitle }}</h1>
            </div>
            
            <!-- Content -->
            <div class="p-6">
              <div class="prose prose-lg max-w-none">
                <div 
                  class="whitespace-pre-wrap break-words font-normal text-gray-900 text-xl leading-relaxed"
                  @dblclick="handleTextDoubleClick"
                  @copy.prevent="handleCopyAttempt"
                  @contextmenu.prevent
                >
                  {{ currentChunk.content }}
                </div>
              </div>
            </div>
          </div>

          <!-- Reading Tools -->
          <div v-if="currentChunk && !isLoading" class="grid grid-cols-2 gap-4 mt-4">
            <!-- Audio Player -->
            <TextAudioPlayer
              :chunk-content="currentChunk.content"
              :chunk-id="currentChunk.id"
            />

            <!-- Text Simplifier -->
            <TextSimplifier
              :chunk-content="currentChunk.content"
            />
          </div>

          <!-- Navigation Buttons -->
          <div v-if="currentChunk && !isLoading" class="mt-6">
            <div class="flex justify-between items-center">
              <BaseButton
                variant="default"
                :disabled="!canGoBack || navigationLoading"
                @click="handleBack"
              >
                Previous
              </BaseButton>
              
              <BaseButton
                v-if="currentChunk.has_next"
                variant="primary"
                :disabled="!canProgress || navigationLoading"
                :loading="navigationLoading"
                @click="handleNext"
              >
                Next Section
              </BaseButton>
              <BaseButton
                v-else
                variant="success"
                :disabled="!canProgress"
                @click="handleComplete"
              >
                Complete Reading
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Question and Dictionary Section -->
        <div class="w-2/5 flex flex-col">
          <!-- Question Panel -->
          <QuestionPanel 
            v-if="currentChunk && !isLoading" 
            @complete="handleComplete"
          />
          
          <!-- Dictionary Panel -->
          <DictionaryPanel
            v-if="currentChunk && !isLoading"
            :selected-word="dictionaryStore.selectedWord"
            :is-loading="dictionaryStore.isLoading"
            :error="dictionaryStore.error"
            :word-data="dictionaryStore.wordData"
            @clear="dictionaryStore.clearSelectedWord()"
            @retry="retryWordLookup"
          />
        </div>
      </div>
    </div>

    <!-- Completion Dialog -->
    <BaseDialog
      v-model="showCompletionDialog"
      title="Reading Complete"
      :content="completionMessage"
      confirm-text="Return to Dashboard"
      cancel-text="Stay on Page"
      @confirm="navigateToDashboard"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ArrowLeft } from 'lucide-vue-next'
import { useReadingStore } from '@/stores/reading'
import { useDictionaryStore } from '@/stores/dictionary'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseDialog from '@/components/base/BaseDialog.vue'
import QuestionPanel from './QuestionPanel.vue'
import TextAudioPlayer from '@/components/student/reading/TextAudioPlayer.vue'
import TextSimplifier from '@/components/student/reading/TextSimplifier.vue'
import DictionaryPanel from '@/components/student/reading/DictionaryPanel.vue'

const route = useRoute()
const router = useRouter()
const readingStore = useReadingStore()
const dictionaryStore = useDictionaryStore()

// Local state
const showError = ref(false)
const canGoBack = ref(false)
const showCompletionDialog = ref(false)
const completionMessage = ref('')

// Store state using storeToRefs for reactivity
const { 
  currentChunk, 
  isLoading, 
  error, 
  textTitle,
  canProgress,
  feedback,
  navigationLoading,
  assessmentId
} = storeToRefs(readingStore)

// Methods

const handleCopyAttempt = () => {
  console.log('Copy attempt detected')
  // Optionally track this behavior or show a message to the student
}

const handleNext = async () => {
  try {
    const result = await readingStore.handleNavigation()
    
    if (result.completed && result.message) {
      completionMessage.value = result.message
      showCompletionDialog.value = true
    }
  } catch (err) {
    showError.value = true
  }
}

const navigateToDashboard = () => {
  router.push({ 
    name: 'student-dashboard',
    query: { 
      completed: 'true',
      assessmentId: assessmentId.value
    }
  })
}

const handleBack = () => {
  if (canGoBack.value) {
    return
  }
  
  if (feedback.value) {
    showCompletionDialog.value = true
  } else {
    router.push({ name: 'student-dashboard' })
  }
}

const handleComplete = async () => {
  try {
    const result = await readingStore.handleNavigation()
    
    if (result.completed && result.message) {
      completionMessage.value = result.message
      showCompletionDialog.value = true
    }
  } catch (err) {
    showError.value = true
  }
}

// Dictionary functionality
const handleTextDoubleClick = () => {
  // Get the selection
  const selection = window.getSelection()
  
  if (selection && selection.toString().trim()) {
    // We have a selection
    const selectedWord = selection.toString().trim()
    dictionaryStore.setSelectedWord(selectedWord)
  }
}

const retryWordLookup = () => {
  if (dictionaryStore.selectedWord) {
    dictionaryStore.lookupWord(dictionaryStore.selectedWord)
  }
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
  dictionaryStore.clearSelectedWord()
})

// Navigation guard
const beforeUnload = (e: BeforeUnloadEvent) => {
  if (feedback.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', beforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', beforeUnload)
})
</script>