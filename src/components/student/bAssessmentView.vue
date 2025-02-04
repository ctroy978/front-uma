<!-- src/views/AssessmentView.vue -->
<template>
    <div class="min-h-screen bg-gray-50">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading assessment...</p>
        </div>
      </div>
  
      <!-- Error State -->
      <BaseAlert
        v-if="error"
        v-model="showAlert"
        :message="error"
        variant="error"
        class="m-4"
        dismissible
      />
  
      <!-- Assessment Interface -->
      <div v-if="!isLoading && !error" class="container mx-auto px-4 py-6">
        <!-- Progress Header -->
        <AssessmentProgress
          :metrics="metrics"
          :current-category="currentCategory"
          :current-difficulty="currentDifficulty"
        />
  
        <!-- Main Assessment Area -->
        <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Reading Pane -->
          <ReadingPane
            :chunk="currentChunk"
            class="lg:sticky lg:top-6 lg:self-start"
          />
  
          <!-- Question and Answer Area -->
          <div class="space-y-6">
            <QuestionPane
              :question="currentQuestion"
              :answer-feedback="lastAnswer"
              :is-submitting="isSubmitting"
              @submit-answer="handleAnswerSubmit"
            />
          </div>
        </div>
  
        <!-- Completion Dialog -->
        <AssessmentComplete
          v-if="showCompletionDialog"
          :completion-data="completionData"
          @close="handleCompletionClose"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useAssessmentStore } from '@/stores/assessment'
  import BaseAlert from '@/components/base/BaseAlert.vue'
  import AssessmentProgress from '@/components/student/AssessmentProgress.vue'
  import ReadingPane from '@/components/student/ReadingPane.vue'
  import QuestionPane from '@/components/student/QuestionPane.vue'
  import AssessmentComplete from '@/components/student/AssessmentComplete.vue'
  
  // Setup
  const route = useRoute()
  const router = useRouter()
  const assessmentStore = useAssessmentStore()
  
  // Local state
  const isSubmitting = ref(false)
  const showCompletionDialog = ref(false)
  const error = ref<string | null>(null)
  const showAlert = ref(true)
  
  // Watch error to handle alert visibility
  watch(error, (newError) => {
    showAlert.value = !!newError
  })
  
  // Computed properties
  const textId = computed(() => route.params.textId as string)
  const isLoading = computed(() => assessmentStore.isLoading)
  const currentChunk = computed(() => assessmentStore.currentChunk)
  const currentQuestion = computed(() => assessmentStore.currentQuestion)
  const lastAnswer = computed(() => assessmentStore.lastAnswer)
  const metrics = computed(() => assessmentStore.metrics)
  const currentCategory = computed(() => assessmentStore.currentCategory)
  const currentDifficulty = computed(() => assessmentStore.currentDifficulty)
  const completionData = computed(() => assessmentStore.completionData)
  
  // Methods
  const initializeAssessment = async () => {
    try {
      // Check existing assessment status
      const status = await assessmentStore.checkAssessmentStatus(textId.value)
      
      if (status.status === 'ACTIVE') {
        // Resume existing assessment
        await assessmentStore.getAssessmentStatus()
      } else if (status.status === 'NEW') {
        // Start new assessment
        await assessmentStore.startAssessment(textId.value)
      } else {
        // Already completed
        router.push({ name: 'assessment-history', params: { textId: textId.value }})
      }
    } catch (e: any) {
      error.value = e.message || 'Failed to initialize assessment'
    }
  }
  
  const handleAnswerSubmit = async (answerText: string) => {
    isSubmitting.value = true
    try {
      const result = await assessmentStore.submitAnswer(answerText)
      if (result.assessment_complete) {
        showCompletionDialog.value = true
      }
    } catch (e: any) {
      error.value = e.message || 'Failed to submit answer'
    } finally {
      isSubmitting.value = false
    }
  }
  
  const handleCompletionClose = () => {
    showCompletionDialog.value = false
    router.push({ name: 'student-dashboard' })
  }
  
  // Lifecycle
  onMounted(async () => {
    await initializeAssessment()
  })
  </script>