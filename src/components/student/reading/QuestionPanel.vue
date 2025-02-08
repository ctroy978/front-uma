<!-- src/components/student/reading/QuestionPanel.vue -->
<template>
    <div v-if="question" class="bg-white shadow rounded-lg p-6">
      <!-- Question Header -->
      <div class="mb-4 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">
          Question
        </h3>
        <span 
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="getCategoryClass(question.category)"
        >
          {{ formatCategory(question.category) }}
        </span>
      </div>
  
      <!-- Question Text -->
      <p class="text-gray-700 text-lg mb-6">
        {{ question.question_text }}
      </p>
  
      <!-- Answer Buttons -->
      <div class="flex space-x-4">
        <BaseButton
          variant="success"
          :disabled="isLoading"
          @click="handleAnswer(true)"
        >
          Correct
        </BaseButton>
        
        <BaseButton
          variant="danger"
          :disabled="isLoading"
          @click="handleAnswer(false)"
        >
          Incorrect
        </BaseButton>
      </div>
  
      <!-- Error Display -->
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
  import { ref, computed } from 'vue'
  import { useReadingStore } from '@/stores/reading'
  import BaseButton from '@/components/base/BaseButton.vue'
  import BaseAlert from '@/components/base/BaseAlert.vue'
  
  const readingStore = useReadingStore()
  const showError = ref(false)
  
  const question = computed(() => readingStore.currentQuestion)
  const isLoading = computed(() => readingStore.isLoading)
  const error = computed(() => readingStore.error)
  
  type QuestionCategory = 'literal_basic' | 'literal_detailed' | 'inferential_simple' | 'inferential_complex';
  
  // Category styling
  const categoryClasses: Record<QuestionCategory, string> = {
    literal_basic: 'bg-blue-100 text-blue-800',
    literal_detailed: 'bg-green-100 text-green-800',
    inferential_simple: 'bg-yellow-100 text-yellow-800',
    inferential_complex: 'bg-purple-100 text-purple-800'
  }
  
  // Get category class with type safety
  const getCategoryClass = (category: string): string => {
    if (isValidCategory(category)) {
      return categoryClasses[category]
    }
    return 'bg-gray-100 text-gray-800' // default fallback
  }
  
  // Type guard for category
  const isValidCategory = (category: string): category is QuestionCategory => {
    return Object.keys(categoryClasses).includes(category)
  }
  
  // Format category for display
  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
  
  // Handle answer submission
  const handleAnswer = async (isCorrect: boolean) => {
    try {
      await readingStore.submitAnswer(isCorrect)
    } catch (err) {
      showError.value = true
    }
  }
  </script>