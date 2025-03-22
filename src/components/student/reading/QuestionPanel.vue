<!-- src/components/student/reading/QuestionPanel.vue -->
<template>
  <div class="bg-white shadow rounded-lg p-6">
    <!-- Question Content -->
    <div v-if="currentQuestion" class="space-y-6">
      <!-- Question Header -->
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">
          {{ isPreQuestion ? 'Reading Check' : 'Question' }}
        </h3>
        <span 
          v-if="!isPreQuestion"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="getCategoryClass(currentQuestion.category)"
        >
          {{ formatCategory(currentQuestion.category) }}
        </span>
        <span 
          v-else
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
        >
          <BookOpen class="h-3 w-3 mr-1" />
          Comprehension Check
        </span>
      </div>

      <!-- Pre-Question Banner -->
      <div v-if="isPreQuestion" class="bg-indigo-50 border border-indigo-100 rounded-md p-3 text-sm text-indigo-700">
        <p>
          <strong>First things first:</strong> Please show your understanding of this passage by answering this basic
          question. Once you demonstrate you've read the text, you'll move on to more in-depth questions.
        </p>
      </div>

      <!-- Question Text -->
      <p class="text-gray-700 text-lg">
        {{ currentQuestion.question_text }}
      </p>

      <!-- Answer Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <BaseTextarea
          v-model="answerInput"
          name="answer"
          :label="isPreQuestion ? 'Your Response' : 'Your Answer'"
          :placeholder="isPreQuestion 
            ? 'Briefly show that you have read the text. A few sentences is fine.' 
            : 'Type your answer here. Be sure to explain your reasoning and use evidence from the text.'"
          :disabled="isSubmitting"
          :error="errorMessage"
          required
        />

        <BaseButton
          type="submit"
          variant="primary"
          :loading="isSubmitting"
          :disabled="!answerInput.trim() || isSubmitting"
          class="w-full"
        >
          Submit {{ isPreQuestion ? 'Response' : 'Answer' }}
        </BaseButton>
      </form>

      <!-- Feedback Display -->
      <TransitionGroup
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform -translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-2 opacity-0"
      >
        <div 
          v-if="feedback"
          :key="feedback"
          class="mt-4 p-4 rounded-md"
          :class="[
            isCorrect 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
          ]"
        >
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <CheckCircle 
                v-if="isCorrect"
                class="h-5 w-5 text-green-400" 
              />
              <AlertCircle
                v-else
                class="h-5 w-5 text-yellow-400"
              />
            </div>
            <div class="ml-3">
              <p class="text-sm whitespace-pre-wrap">{{ feedback }}</p>
              
              <!-- For regular question feedback -->
              <div 
                v-if="isCorrect && !isPreQuestion && !canProgress" 
                class="mt-2 text-sm bg-green-100 p-2 rounded-md"
              >
                {{ hasAnsweredMainQuestion ? 'Get one more correct answer to unlock the next section.' : 'Good answer! Keep answering correctly to unlock the next section.' }}
              </div>
              
              <!-- Only show transition message for correctly answered pre-questions -->
              <div 
                v-if="isCorrect && isPreQuestion && !isPreQuestionMode" 
                class="mt-2 text-sm bg-green-100 p-2 rounded-md"
              >
                Great! Now you'll move on to analytical questions about the text.
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Status (hidden in production) -->
        <div 
          v-if="showDebugPanel"
          :key="'nav-status'"
          class="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm"
        >
          <p class="font-medium">Navigation Status:</p>
          <ul class="mt-1 ml-4 list-disc text-xs">
            <li>Pre-question passed: <span class="font-semibold">{{ !isPreQuestion ? "Yes" : "No" }}</span></li>
            <li>Main question answered: <span class="font-semibold">{{ hasAnsweredMainQuestion ? "Yes" : "No" }}</span></li>
            <li>Can progress: <span class="font-semibold">{{ canProgress ? "Yes" : "No" }}</span></li>
          </ul>
        </div>

        <!-- Progress Status -->
        <button 
          v-if="showContinueButton"
          :key="'progress'"
          class="mt-4 w-full flex items-center justify-center bg-blue-50 hover:bg-blue-100 
                text-blue-700 p-4 rounded-md border border-blue-200 transition-colors"
          :disabled="navigationLoading"
          @click="handleProgressClick"
        >
          <div v-if="navigationLoading" class="mr-2">
            <div class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <ArrowRight v-else class="h-5 w-5 mr-2" />
          <span class="text-sm font-medium">
            {{ currentChunk?.has_next ? 'Continue to next section' : 'Complete reading assessment' }}
          </span>
        </button>
      </TransitionGroup>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="py-12 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
      <p class="mt-2 text-sm text-gray-500">Loading question...</p>
    </div>

    <!-- Error State -->
    <BaseAlert
      v-if="showError"
      v-model="showError"
      variant="error"
      :message="alertMessage"
      dismissible
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { CheckCircle, AlertCircle, ArrowRight, BookOpen } from 'lucide-vue-next'
import { useReadingStore } from '@/stores/reading'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'

// Flag to enable/disable debug panel - can be set to false for production
const isDevMode = ref(false) // Set to false to hide in production

const emit = defineEmits<{
  (e: 'complete'): void
}>()

const readingStore = useReadingStore()
const { 
  currentQuestion, 
  isLoading, 
  error: storeError, 
  feedback, 
  canProgress, 
  isSubmitting, 
  navigationLoading, 
  currentChunk,
  isPreQuestionMode,
  hasAnsweredMainQuestion
} = storeToRefs(readingStore)

// Local state
const answerInput = ref('')
const showError = ref(false)

// Computed properties
const isPreQuestion = computed(() => currentQuestion.value?.is_pre_question || isPreQuestionMode.value)
const isCorrect = computed(() => canProgress.value || (feedback.value && readingStore.hasFeedback))

// Computed property for debug panel
const showDebugPanel = computed(() => {
  return isDevMode.value && isCorrect.value && !isPreQuestion.value
})

// New computed property to determine if we should show the continue button
const showContinueButton = computed(() => {
  return (
    isCorrect.value && 
    !isPreQuestion.value && 
    (canProgress.value || hasAnsweredMainQuestion.value)
  )
})

// Convert null error to undefined for BaseTextarea
const errorMessage = computed(() => storeError.value || undefined)

// Convert null error to undefined for BaseAlert
const alertMessage = computed(() => storeError.value || undefined)

// Question category styling
const categoryClasses: Record<string, string> = {
  literal_basic: 'bg-blue-100 text-blue-800',
  literal_detailed: 'bg-green-100 text-green-800',
  inferential_simple: 'bg-yellow-100 text-yellow-800',
  inferential_complex: 'bg-purple-100 text-purple-800',
  vocabulary_context: 'bg-pink-100 text-pink-800',
  structural_basic: 'bg-orange-100 text-orange-800',
  structural_advanced: 'bg-purple-100 text-purple-800'
}

// Methods
const getCategoryClass = (category?: string): string => {
  if (!category) return 'bg-gray-100 text-gray-800';
  return categoryClasses[category] || 'bg-gray-100 text-gray-800'
}

const formatCategory = (category?: string): string => {
  if (!category) return '';
  
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const handleSubmit = async () => {
  if (!answerInput.value.trim()) return
  
  try {
    await readingStore.submitAnswer(answerInput.value)
    answerInput.value = '' // Clear input after submission
  } catch (err) {
    showError.value = true
  }
}

const handleProgressClick = async () => {
  if (!currentChunk.value?.has_next) {
    // If on last chunk, emit complete event for parent to handle
    emit('complete')
  } else {
    // Regular next section navigation
    try {
      await readingStore.handleNavigation()
    } catch (err) {
      showError.value = true
    }
  }
}

// Watch for question changes to reset form state
watch(() => currentQuestion.value?.question_text, () => {
  answerInput.value = ''
  showError.value = false
}, { immediate: true })

// Watch for errors to show alert
watch(() => storeError.value, (newError) => {
  if (newError) {
    showError.value = true
  }
})
</script>