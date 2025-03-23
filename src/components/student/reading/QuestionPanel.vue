<!-- src/components/student/reading/QuestionPanel.vue -->
<template>
  <div 
    class="space-y-6"
    @copy.prevent="handleCopyAttempt"
    @cut.prevent="handleCopyAttempt"
  >
    <!-- Copy Attempt Alert -->
    <div 
      v-if="showCopyAlert"
      class="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-lg z-50 flex items-center"
      role="alert"
    >
      <div class="flex-shrink-0 mr-2">
        <ShieldAlert class="h-5 w-5 text-red-500" />
      </div>
      <span>Copying questions is not allowed</span>
    </div>
    
    <!-- Reading Check (Pre-question) Section -->
    <div
      class="bg-white shadow rounded-lg p-6 border-l-4"
      :class="[
        preQuestionCorrect
          ? 'border-green-500'
          : 'border-indigo-500'
      ]"
    >
      <div v-if="preQuestion">
        <!-- Question Header -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900 flex items-center">
            <BookOpen class="h-5 w-5 mr-2 text-indigo-500" />
            Reading Check
          </h3>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
          >
            Understanding Check
          </span>
        </div>

        <!-- Question Text -->
        <p class="text-gray-700 text-base mb-4 no-select">
          {{ preQuestion.question_text }}
        </p>

        <!-- Form -->
        <div v-if="!preQuestionCorrect">
          <form @submit.prevent="handlePreQuestionSubmit" class="space-y-4">
            <BaseTextarea
              v-model="preAnswerInput"
              name="pre-answer"
              label="Your Response"
              placeholder="Briefly show that you have read the text. A few sentences is fine."
              :disabled="isSubmittingPre"
              :error="errorMessage"
              required
            />

            <BaseButton
              type="submit"
              variant="primary"
              :loading="isSubmittingPre"
              :disabled="!preAnswerInput.trim() || isSubmittingPre"
              class="w-full"
            >
              Submit Response
            </BaseButton>
          </form>
        </div>

        <!-- Feedback -->
        <TransitionGroup
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-2 opacity-0"
        >
          <div
            v-if="preFeedback"
            :key="'pre-feedback'"
            class="mt-4 p-4 rounded-md"
            :class="[
              preQuestionCorrect
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            ]"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <CheckCircle
                  v-if="preQuestionCorrect"
                  class="h-5 w-5 text-green-400"
                />
                <AlertCircle
                  v-else
                  class="h-5 w-5 text-yellow-400"
                />
              </div>
              <div class="ml-3">
                <p class="text-sm whitespace-pre-wrap no-select">{{ preFeedback }}</p>
                
                <!-- Next steps guidance -->
                <div 
                  v-if="preQuestionCorrect" 
                  class="mt-2 text-sm bg-green-100 p-2 rounded-md no-select"
                >
                  <p class="font-medium">Great! Now please answer the critical thinking question below.</p>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- Loading state -->
      <div v-else-if="isPreQuestionLoading" class="py-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
        <p class="mt-2 text-sm text-gray-500">Loading question...</p>
      </div>
    </div>

    <!-- Critical Thinking (Main question) Section -->
    <div
      class="bg-white shadow rounded-lg p-6 border-l-4"
      :class="[
        !isMainQuestionEnabled
          ? 'border-gray-300 opacity-75'
          : mainQuestionCorrect
            ? 'border-green-500'
            : 'border-blue-500'
      ]"
    >
      <div v-if="mainQuestion">
        <!-- Question Header -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900 flex items-center">
            <BrainCircuit class="h-5 w-5 mr-2 text-blue-500" />
            Critical Thinking
          </h3>
          <span
            v-if="mainQuestion.category"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="getCategoryClass(mainQuestion.category)"
          >
            {{ formatCategory(mainQuestion.category) }}
          </span>
        </div>

        <!-- Locked overlay if pre-question not correct -->
        <div v-if="!isMainQuestionEnabled" class="relative">
          <div class="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded-md">
            <div class="text-center p-4">
              <Lock class="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p class="text-sm text-gray-600 font-medium">Answer the reading check above to unlock</p>
            </div>
          </div>
          
          <!-- Blurred question preview -->
          <div class="filter blur-sm pointer-events-none">
            <p class="text-gray-700 text-base mb-4">
              {{ mainQuestion.question_text }}
            </p>
            
            <div class="h-32 bg-gray-50 rounded-md"></div>
          </div>
        </div>

        <!-- Enabled main question -->
        <div v-else>
          <!-- Question Text -->
          <p class="text-gray-700 text-base mb-4 no-select">
            {{ mainQuestion.question_text }}
          </p>

          <!-- Form -->
          <div v-if="!mainQuestionCorrect">
            <form @submit.prevent="handleMainQuestionSubmit" class="space-y-4">
              <BaseTextarea
                v-model="mainAnswerInput"
                name="main-answer"
                label="Your Answer"
                placeholder="Type your answer here. Be sure to explain your reasoning and use evidence from the text."
                :disabled="isSubmittingMain"
                :error="errorMessage"
                required
              />

              <BaseButton
                type="submit"
                variant="primary"
                :loading="isSubmittingMain"
                :disabled="!mainAnswerInput.trim() || isSubmittingMain"
                class="w-full"
              >
                Submit Answer
              </BaseButton>
            </form>
          </div>

          <!-- Feedback -->
          <TransitionGroup
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform -translate-y-2 opacity-0"
            enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform -translate-y-2 opacity-0"
          >
            <div
              v-if="mainFeedback"
              :key="'main-feedback'"
              class="mt-4 p-4 rounded-md"
              :class="[
                mainQuestionCorrect
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              ]"
            >
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <CheckCircle
                    v-if="mainQuestionCorrect"
                    class="h-5 w-5 text-green-400"
                  />
                  <AlertCircle
                    v-else
                    class="h-5 w-5 text-yellow-400"
                  />
                </div>
                <div class="ml-3">
                  <p class="text-sm whitespace-pre-wrap no-select">{{ mainFeedback }}</p>
                </div>
              </div>
            </div>

            <!-- Continue Button -->
            <button
              v-if="canProgress"
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
      </div>

      <!-- Loading state -->
      <div v-else-if="isMainQuestionLoading" class="py-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
        <p class="mt-2 text-sm text-gray-500">Loading question...</p>
      </div>
    </div>

    <!-- Error Alert -->
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  BookOpen, 
  BrainCircuit,
  Lock,
  ShieldAlert
} from 'lucide-vue-next'
import { useReadingStore } from '@/stores/reading'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'

const emit = defineEmits<{
  (e: 'complete'): void
}>()

const readingStore = useReadingStore()
const { 
  preQuestion,
  preQuestionCorrect,
  preFeedback,
  isPreQuestionLoading,
  isSubmittingPre,
  
  mainQuestion,
  mainQuestionCorrect,
  mainFeedback,
  isMainQuestionLoading,
  isSubmittingMain,
  
  currentChunk,
  error,
  navigationLoading,
  canProgress
} = storeToRefs(readingStore)

// Local state
const preAnswerInput = ref('')
const mainAnswerInput = ref('')
const showError = ref(false)
const showCopyAlert = ref(false)
const copyAlertTimer = ref<number | null>(null)

// Computed properties
const isMainQuestionEnabled = computed(() => readingStore.isMainQuestionEnabled)
const errorMessage = computed(() => error.value || undefined)
const alertMessage = computed(() => error.value || undefined)

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

const handlePreQuestionSubmit = async () => {
  if (!preAnswerInput.value.trim()) return
  
  try {
    await readingStore.submitPreAnswer(preAnswerInput.value)
    preAnswerInput.value = '' // Clear input after submission
  } catch (err) {
    showError.value = true
  }
}

const handleMainQuestionSubmit = async () => {
  if (!mainAnswerInput.value.trim()) return
  
  try {
    await readingStore.submitMainAnswer(mainAnswerInput.value)
    mainAnswerInput.value = '' // Clear input after submission
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

// Handle copy attempt
const handleCopyAttempt = (event: Event) => {
  // Prevent the default copy/cut action
  event.preventDefault()
  
  // Show the copy alert
  showCopyAlert.value = true
  
  // Clear any existing timer
  if (copyAlertTimer.value !== null) {
    window.clearTimeout(copyAlertTimer.value)
  }
  
  // Set a timer to hide the alert after 3 seconds
  copyAlertTimer.value = window.setTimeout(() => {
    showCopyAlert.value = false
  }, 3000)
  
  // Optional: log the copy attempt for monitoring
  console.log('Copy attempt detected in question panel')
}

// Add keyboard shortcut listener for copy/cut commands
const handleKeyDown = (event: KeyboardEvent) => {
  // Check for Ctrl+C, Ctrl+X, or Command+C, Command+X
  if ((event.ctrlKey || event.metaKey) && (event.key === 'c' || event.key === 'x')) {
    // Check if selection is within the question panel
    const selection = window.getSelection()
    if (selection && selection.toString().trim() !== '') {
      // If there's text selected, check if it's within our component
      let isWithinQuestionPanel = false
      let currentNode = selection.anchorNode
      
      while (currentNode) {
        if (currentNode.nodeType === Node.ELEMENT_NODE && 
            (currentNode as Element).classList.contains('no-select')) {
          isWithinQuestionPanel = true
          break
        }
        currentNode = currentNode.parentNode
      }
      
      if (isWithinQuestionPanel) {
        event.preventDefault()
        handleCopyAttempt(event)
      }
    }
  }
}

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  if (copyAlertTimer.value !== null) {
    window.clearTimeout(copyAlertTimer.value)
  }
})

// Watch for question changes to reset form state
watch(() => preQuestion.value?.question_text, () => {
  preAnswerInput.value = ''
}, { immediate: true })

watch(() => mainQuestion.value?.question_text, () => {
  mainAnswerInput.value = ''
}, { immediate: true })

// Watch for errors to show alert
watch(() => error.value, (newError) => {
  if (newError) {
    showError.value = true
  }
})
</script>

<style scoped>
.no-select {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Optional: Modify cursor to indicate copying is not allowed */
.no-select {
  cursor: default;
}
</style>