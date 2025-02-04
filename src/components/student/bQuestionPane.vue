<!-- src/views/components/QuestionPane.vue -->
<template>
    <div class="bg-white rounded-lg shadow">
      <!-- Question Section -->
      <div class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Question</h2>
        
        <div v-if="question" class="space-y-4">
          <!-- Question category badge -->
          <div class="flex space-x-2">
            <span 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="categoryClasses[question.category]"
            >
              {{ formatCategory(question.category) }}
            </span>
            <span 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            >
              {{ formatDifficulty(question.difficulty) }}
            </span>
          </div>
  
          <!-- Question text -->
          <p class="text-gray-700">{{ question.text }}</p>
  
          <!-- Answer feedback if available -->
          <div v-if="answerFeedback" class="mt-4">
            <div 
              class="p-4 rounded-md"
              :class="answerFeedback.isCorrect ? 'bg-green-50' : 'bg-red-50'"
            >
              <p 
                class="text-sm font-medium"
                :class="answerFeedback.isCorrect ? 'text-green-800' : 'text-red-800'"
              >
                {{ answerFeedback.isCorrect ? 'Correct!' : 'Incorrect' }}
              </p>
              <p 
                class="mt-1 text-sm"
                :class="answerFeedback.isCorrect ? 'text-green-700' : 'text-red-700'"
              >
                {{ answerFeedback.feedback }}
              </p>
            </div>
          </div>
  
          <!-- Answer input -->
          <div class="mt-4">
            <label for="answer" class="block text-sm font-medium text-gray-700">
              Your Answer
            </label>
            <textarea
              id="answer"
              v-model="answerText"
              rows="4"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              :disabled="isSubmitting"
              :placeholder="isSubmitting ? 'Submitting...' : 'Type your answer here...'"
            ></textarea>
          </div>
  
          <!-- Submit button -->
          <div class="mt-4">
            <button
              type="button"
              @click="submitAnswer"
              :disabled="!canSubmit || isSubmitting"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSubmitting">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
              <span v-else>
                Submit Answer
              </span>
            </button>
          </div>
        </div>
  
        <div v-else class="text-gray-500 italic">
          No question available
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import type { Question, QuestionCategory, QuestionDifficulty } from '@/stores/assessment'
  
  // Props
  interface Props {
    question: Question | null
    answerFeedback: {
      isCorrect: boolean
      feedback: string
    } | null
    isSubmitting: boolean
  }
  
  const props = defineProps<Props>()
  const emit = defineEmits<{
    (e: 'submit-answer', answer: string): void
  }>()
  
  // State
  const answerText = ref('')
  
  // Computed
  const canSubmit = computed(() => answerText.value.trim().length > 0 && !props.isSubmitting)
  
  // Category styling
  const categoryClasses: Record<QuestionCategory, string> = {
    'literal_basic': 'bg-green-100 text-green-800',
    'literal_detailed': 'bg-blue-100 text-blue-800',
    'vocabulary_context': 'bg-purple-100 text-purple-800',
    'inferential_simple': 'bg-yellow-100 text-yellow-800',
    'inferential_complex': 'bg-orange-100 text-orange-800',
    'structural_basic': 'bg-pink-100 text-pink-800',
    'structural_advanced': 'bg-red-100 text-red-800'
  }
  
  // Methods
  const formatCategory = (category: QuestionCategory): string => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }
  
  const formatDifficulty = (difficulty: QuestionDifficulty): string => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
  }
  
  const submitAnswer = () => {
    if (canSubmit.value) {
      emit('submit-answer', answerText.value)
      answerText.value = '' // Clear the input after submission
    }
  }
  </script>