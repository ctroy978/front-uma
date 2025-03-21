<!-- src/views/student/CompletionTestView.vue -->
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
          
          <!-- Test Title -->
          <h1 class="text-xl font-semibold text-gray-900">Completion Test: {{ textTitle }}</h1>
          
          <!-- Progress -->
          <div v-if="currentQuestion" class="text-sm text-gray-500">
            Question {{ currentQuestionIndex }} of {{ totalQuestionsCount }}
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-4 text-gray-600">{{ loadingMessage }}</p>
      </div>

      <!-- Error Alert -->
      <BaseAlert
        v-if="error"
        v-model="showError"
        variant="error"
        :message="error"
        dismissible
      />

      <!-- Test Introduction -->
      <div v-if="!isLoading && !currentQuestion && !testResults && !isStarted" class="bg-white shadow rounded-lg p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Completion Test</h2>
        <p class="mb-4">You are about to begin your completion test for: <strong>{{ textTitle }}</strong></p>
        
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <AlertCircle class="h-5 w-5 text-yellow-400" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-yellow-700">
                This test will assess your understanding of the entire text. Be sure to answer each question thoroughly, using details from the text.
              </p>
            </div>
          </div>
        </div>
        
        <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <Info class="h-5 w-5 text-blue-400" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-blue-700 mb-1">Tips:</p>
              <ul class="list-disc ml-5 text-sm text-blue-700">
                <li>Think carefully about each question</li>
                <li>Support your answers with evidence from the text</li>
                <li>You cannot change your answers once submitted</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="mt-6">
          <BaseButton
            variant="primary"
            size="lg"
            @click="startTest"
          >
            Begin Test
          </BaseButton>
        </div>
      </div>

      <!-- Current Question -->
      <div v-if="!isLoading && currentQuestion && !testResults" class="bg-white shadow rounded-lg p-6">
        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div 
            class="bg-blue-600 h-2.5 rounded-full" 
            :style="`width: ${calculateProgressPercentage()}%`"
          ></div>
        </div>
        
        <!-- Category Badge -->
        <div class="mb-4 flex justify-end">
          <span 
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="getCategoryClass(currentQuestion.category)"
          >
            {{ formatCategory(currentQuestion.category) }}
          </span>
        </div>
        
        <!-- Question Text -->
        <h3 class="text-lg font-medium text-gray-900 mb-4">{{ currentQuestion.question_text }}</h3>
        
        <!-- Answer Input -->
        <div class="mt-6">
          <BaseTextarea
            v-model="currentAnswer"
            name="answer"
            label="Your Answer"
            placeholder="Type your answer here. Be thorough and use evidence from the text to support your answer."
            :disabled="isSubmitting"
            :error="errorMessage"
            :rows="8"
            required
          />
        </div>
        
        <!-- Actions -->
        <div class="mt-6 flex justify-end">
          <BaseButton
            @click="submitAnswer"
            variant="primary"
            :loading="isSubmitting"
            :disabled="!currentAnswer.trim() || isSubmitting"
          >
            {{ !hasRemainingQuestions ? 'Submit & Complete Test' : 'Submit & Continue' }}
          </BaseButton>
        </div>
      </div>

      <!-- Test Results -->
      <div v-if="!isLoading && testResults" class="bg-white shadow rounded-lg p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Test Results</h2>
        
        <!-- Overall Score -->
        <div class="flex items-center justify-center mb-8">
          <div class="relative w-40 h-40">
            <svg class="w-full h-full" viewBox="0 0 36 36">
              <!-- Background Circle -->
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e6e6e6" stroke-width="2"></circle>
              
              <!-- Score Circle -->
              <circle 
                cx="18" 
                cy="18" 
                r="15.9" 
                fill="none" 
                :stroke="getScoreColor(testResults.overall_score)" 
                stroke-width="2"
                :stroke-dasharray="100"
                :stroke-dashoffset="100 - testResults.overall_score"
                transform="rotate(-90 18 18)"
              ></circle>
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <span class="text-4xl font-bold">{{ Math.round(testResults.overall_score) }}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-500">Correct Answers</p>
            <p class="text-xl font-semibold">{{ testResults.correct_answers }} / {{ testResults.total_questions }}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-500">Result</p>
            <p 
              class="text-xl font-semibold"
              :class="testResults.overall_score >= 70 ? 'text-green-600' : 'text-red-600'"
            >
              {{ testResults.overall_score >= 70 ? 'Passed' : 'Need Improvement' }}
            </p>
          </div>
        </div>
        
        <!-- Category Breakdown -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-3">Category Performance</h3>
          <div class="space-y-3">
            <div 
              v-for="(score, category) in testResults.category_scores" 
              :key="category"
              class="flex items-center"
            >
              <span class="text-sm font-medium w-1/3">{{ formatCategory(category) }}</span>
              <div class="w-2/3">
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    class="h-2.5 rounded-full" 
                    :class="getCategoryPerformanceClass(score)"
                    :style="`width: ${score}%`"
                  ></div>
                </div>
                <div class="flex justify-between text-xs mt-1">
                  <span>{{ Math.round(score) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="mt-8 flex justify-center">
          <BaseButton
            variant="primary"
            @click="returnToDashboard"
          >
            Return to Dashboard
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <BaseDialog
      v-model="showConfirmDialog"
      title="Return to Dashboard"
      content="Are you sure you want to leave the test? Your progress will be lost."
      confirm-text="Leave Test"
      cancel-text="Stay"
      @confirm="confirmLeaveTest"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, AlertCircle, Info } from 'lucide-vue-next'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'
import BaseDialog from '@/components/base/BaseDialog.vue'
import api from '@/utils/axios'

// Props and route params
const route = useRoute()
const router = useRouter()
const completionId = computed(() => route.params.id as string)

// State
const isLoading = ref(true)
const loadingMessage = ref('Loading test...')
const error = ref('')
const showError = ref(false)
const isStarted = ref(false)
const textTitle = ref('')
const currentQuestion = ref<any>(null)
const currentAnswer = ref('')
const testResults = ref<any>(null)
const isSubmitting = ref(false)
const showConfirmDialog = ref(false)
const hasRemainingQuestions = ref(true)
const totalQuestionsCount = ref(0)

// Computed properties
const errorMessage = computed(() => error.value || undefined)

// Track visited question IDs to calculate accurate progress
const visitedQuestionIds = ref(new Set<string>())
const currentQuestionIndex = ref(0)

// Methods
const calculateProgressPercentage = () => {
  if (!currentQuestion.value) return 0
  
  // Use our own tracking instead of server-provided progress
  const answeredCount = Math.max(1, currentQuestionIndex.value)
  const total = currentQuestion.value.total_questions || totalQuestionsCount.value
  
  // Ensure we don't divide by zero
  if (total <= 0) return 0
  
  return (answeredCount / total) * 100
}

const startTest = async () => {
  try {
    isLoading.value = true
    isStarted.value = true
    error.value = ''
    
    // Reset progress tracking
    visitedQuestionIds.value = new Set<string>()
    currentQuestionIndex.value = 0
    
    const response = await api.post(`/completion-test/${completionId.value}/initialize`)
    
    if (response.data.first_question_id) {
      totalQuestionsCount.value = response.data.questions_count
      await loadQuestion(response.data.first_question_id)
    } else {
      // If no questions exist yet, try to get the first question
      const firstQuestionResponse = await api.get(`/completion-test/${completionId.value}/first-question`)
      if (firstQuestionResponse.data.first_question_id) {
        totalQuestionsCount.value = firstQuestionResponse.data.total_questions
        await loadQuestion(firstQuestionResponse.data.first_question_id)
      } else {
        throw new Error('No questions available for this test')
      }
    }
  } catch (err: any) {
    handleError(err, 'Failed to start test')
  } finally {
    isLoading.value = false
  }
}

const loadQuestion = async (questionId: string) => {
  try {
    isLoading.value = true
    loadingMessage.value = 'Loading question...'
    
    const response = await api.get(`/completion-test/${completionId.value}/question/${questionId}`)
    currentQuestion.value = response.data
    currentAnswer.value = ''
    
    // Store the total question count if we have it
    if (response.data.total_questions) {
      totalQuestionsCount.value = response.data.total_questions
    }
    
    // Track this question as visited
    if (!visitedQuestionIds.value.has(questionId)) {
      visitedQuestionIds.value.add(questionId)
      // Only increment the index for new questions
      currentQuestionIndex.value += 1
    }
    
    // Check if we have more questions after this one
    await checkRemainingQuestions()
    
  } catch (err: any) {
    handleError(err, 'Failed to load question')
  } finally {
    isLoading.value = false
  }
}

const submitAnswer = async () => {
  if (!currentAnswer.value.trim()) return
  
  try {
    isSubmitting.value = true
    error.value = ''
    
    // Submit the answer
    const response = await api.post(
      `/completion-test/${completionId.value}/question/${currentQuestion.value.id}/answer`,
      { answer: currentAnswer.value }
    )
    
    // Always check for more unanswered questions before deciding to finalize
    const unansweredResponse = await api.get(
      `/completion-test/${completionId.value}/unanswered-questions`
    )
    
    if (unansweredResponse.data.unanswered_count > 0) {
      // We still have unanswered questions
      if (response.data.next_question_id) {
        // If the server provided a next question ID, use it
        await loadQuestion(response.data.next_question_id)
      } else if (unansweredResponse.data.questions && unansweredResponse.data.questions.length > 0) {
        // Otherwise, take the first unanswered question
        await loadQuestion(unansweredResponse.data.questions[0].id)
      }
    } else {
      // No more unanswered questions, so finalize the test
      await finalizeTest()
    }
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Failed to submit answer'
    showError.value = true
  } finally {
    isSubmitting.value = false
  }
}

const finalizeTest = async () => {
  try {
    isSubmitting.value = true
    error.value = ''
    
    // Check if we have any unanswered questions first
    try {
      const unansweredResponse = await api.get(
        `/completion-test/${completionId.value}/unanswered-questions`
      )
      
      if (unansweredResponse.data.questions && 
          unansweredResponse.data.questions.length > 0) {
        // We have unanswered questions, don't finalize yet
        error.value = `You still have ${unansweredResponse.data.questions.length} unanswered questions.`
        showError.value = true
        
        // Load the first unanswered question
        await loadQuestion(unansweredResponse.data.questions[0].id)
        return
      }
    } catch (checkError: any) {
      // If this endpoint doesn't exist, continue with finalization
    }
    
    // If we got here, attempt to finalize
    const response = await api.post(`/completion-test/${completionId.value}/finalize`)
    testResults.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Failed to finalize test'
    showError.value = true
  } finally {
    isSubmitting.value = false
  }
}

const handleBack = () => {
  if (isStarted.value && !testResults.value) {
    // Only show confirmation if test is in progress
    showConfirmDialog.value = true
  } else {
    returnToDashboard()
  }
}

const confirmLeaveTest = () => {
  returnToDashboard()
}

const returnToDashboard = () => {
  router.push({ name: 'student-dashboard' })
}

const formatCategory = (category: string | number): string => {
  // Convert number to string if needed
  const categoryStr = typeof category === 'number' ? String(category) : category
  
  return categoryStr
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getCategoryClass = (category: string | number): string => {
  const classes: Record<string, string> = {
    'literal_basic': 'bg-blue-100 text-blue-800',
    'literal_detailed': 'bg-green-100 text-green-800',
    'inferential_simple': 'bg-yellow-100 text-yellow-800',
    'inferential_complex': 'bg-purple-100 text-purple-800',
    'vocabulary_context': 'bg-pink-100 text-pink-800',
    'structural_basic': 'bg-indigo-100 text-indigo-800',
    'structural_advanced': 'bg-red-100 text-red-800'
  }
  
  return classes[category] || 'bg-gray-100 text-gray-800'
}

const getCategoryPerformanceClass = (score: number): string => {
  if (score >= 80) return 'bg-green-600'
  if (score >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#059669' // green-600
  if (score >= 60) return '#d97706' // yellow-600
  return '#dc2626' // red-600
}

const handleError = (err: any, defaultMessage: string) => {
  console.error(err)
  error.value = err.response?.data?.detail || defaultMessage
  showError.value = true
}

const fetchTestDetails = async () => {
  try {
    isLoading.value = true
    
    // Get completion details to show the text title
    const response = await api.get(`/student/completion/${completionId.value}`)
    textTitle.value = response.data.text_title || 'Completion Test'
    
  } catch (err: any) {
    handleError(err, 'Failed to load test details')
  } finally {
    isLoading.value = false
  }
}

// Navigation guard - confirm before leaving
const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
  if (isStarted.value && !testResults.value) {
    e.preventDefault()
    e.returnValue = ''
    return ''
  }
}

// Add this new function
const checkRemainingQuestions = async () => {
  try {
    const response = await api.get(
      `/completion-test/${completionId.value}/unanswered-questions`
    )
    
    // If there's only 1 question left (the current one), we're on the last question
    hasRemainingQuestions.value = response.data.unanswered_count > 1
    
  } catch (err: any) {
    // Default to false if we can't determine
    hasRemainingQuestions.value = false
  }
}

// Lifecycle hooks
onMounted(async () => {
  window.addEventListener('beforeunload', beforeUnloadHandler)
  await fetchTestDetails()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnloadHandler)
})
</script>