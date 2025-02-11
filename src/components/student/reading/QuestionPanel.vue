<!-- src/components/student/reading/QuestionPanel.vue -->
<template>
  <div class="bg-white shadow rounded-lg p-6">
    <!-- Question Content -->
    <div v-if="currentQuestion" class="space-y-6">
      <!-- Question Header -->
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">
          Question
        </h3>
        <span 
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="getCategoryClass(currentQuestion.category)"
        >
          {{ formatCategory(currentQuestion.category) }}
        </span>
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
    label="Your Answer"
    placeholder="Type your answer here. Be sure to explain your reasoning and use evidence from the text."
    :disabled="isSubmitting"
    :error="error"
    required
  />

  <BaseButton
    type="submit"
    variant="primary"
    :loading="isSubmitting"
    :disabled="!answerInput.trim() || isSubmitting"
    class="w-full"
  >
    Submit Answer
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
              <div 
                v-if="isCorrect && !canProgress" 
                class="mt-2 text-sm bg-green-100 p-2 rounded-md"
              >
                Get one more correct answer to unlock the next section.
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Status -->
        <button 
          v-if="isCorrect && canProgress" 
          :key="'progress'"
          class="mt-4 w-full flex items-center justify-center bg-blue-50 hover:bg-blue-100 
                text-blue-700 p-4 rounded-md border border-blue-200 transition-colors"
          :disabled="navigationLoading"
          @click="handleNext"
        >
          <div v-if="navigationLoading" class="mr-2">
            <div class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <ArrowRight v-else class="h-5 w-5 mr-2" />
          <span class="text-sm font-medium">
            {{ navigationLoading ? 'Loading next section...' : 'Click here or press Next to continue' }}
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
      v-if="error"
      v-model="showError"
      variant="error"
      :message="error"
      dismissible
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-vue-next'
import { useReadingStore } from '@/stores/reading'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'


const readingStore = useReadingStore()
const { currentQuestion, isLoading, error, feedback, canProgress, isSubmitting, navigationLoading } = storeToRefs(readingStore)

// Local state
const answerInput = ref('')
const showError = ref(false)

// Computed properties
const isCorrect = computed(() => canProgress.value || (feedback.value && readingStore.hasFeedback))

// Question category styling
const categoryClasses: Record<string, string> = {
  literal_basic: 'bg-blue-100 text-blue-800',
  literal_detailed: 'bg-green-100 text-green-800',
  inferential_simple: 'bg-yellow-100 text-yellow-800',
  inferential_complex: 'bg-purple-100 text-purple-800'
}

// Methods
const getCategoryClass = (category: string): string => {
  return categoryClasses[category] || 'bg-gray-100 text-gray-800'
}

const formatCategory = (category: string): string => {
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

const handleNext = async () => {
  try {
    await readingStore.handleNavigation()
  } catch (err) {
    showError.value = true
  }
}

// Watch for question changes to reset form state
watch(() => currentQuestion.value?.question_text, () => {
  answerInput.value = ''
  showError.value = false
}, { immediate: true })

// Watch for errors to show alert
watch(() => error.value, (newError) => {
  if (newError) {
    showError.value = true
  }
})
</script>