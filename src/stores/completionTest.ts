// src/stores/completionTest.ts
import { defineStore } from 'pinia'
import api from '@/utils/axios'

interface CompletionTestQuestion {
  id: string
  question_text: string
  category: string
  is_last: boolean
  progress: number
  total_questions: number
}

interface TestResults {
  overall_score: number
  correct_answers: number
  total_questions: number
  category_scores: Record<string, number>
  completion_id: string
}



interface CompletionTestState {
  completionId: string | null
  textId: string | null
  textTitle: string | null
  currentQuestion: CompletionTestQuestion | null
  isStarted: boolean
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  results: TestResults | null
}

export const useCompletionTestStore = defineStore('completionTest', {
  state: (): CompletionTestState => ({
    completionId: null,
    textId: null,
    textTitle: null,
    currentQuestion: null,
    isStarted: false,
    isLoading: false,
    isSubmitting: false,
    error: null,
    results: null
  }),

  getters: {
    isComplete: (state) => !!state.results,
    hasError: (state) => !!state.error
  },

  actions: {
    async fetchTestDetails(completionId: string) {
      this.isLoading = true
      this.error = null
      this.completionId = completionId

      try {
        const response = await api.get(`/student/completion/${completionId}`)
        this.textTitle = response.data.text_title
        this.textId = response.data.text_id
        return response.data
      } catch (error: any) {
        this.handleError(error, 'Failed to fetch test details')
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async initializeTest() {
      if (!this.completionId) {
        throw new Error('No completion ID specified')
      }

      this.isLoading = true
      this.isStarted = true
      this.error = null

      try {
        const response = await api.post(`/completion-test/${this.completionId}/initialize`)
        return response.data
      } catch (error: any) {
        this.handleError(error, 'Failed to initialize test')
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async getFirstQuestion() {
      if (!this.completionId) {
        throw new Error('No completion ID specified')
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await api.get(`/completion-test/${this.completionId}/first-question`)
        return response.data.first_question_id
      } catch (error: any) {
        this.handleError(error, 'Failed to get first question')
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async loadQuestion(questionId: string) {
      if (!this.completionId) {
        throw new Error('No completion ID specified')
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await api.get(
          `/completion-test/${this.completionId}/question/${questionId}`
        )
        this.currentQuestion = response.data
        return response.data
      } catch (error: any) {
        this.handleError(error, 'Failed to load question')
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async submitAnswer(questionId: string, answer: string) {
      if (!this.completionId) {
        throw new Error('No completion ID specified')
      }

      this.isSubmitting = true
      this.error = null

      try {
        const response = await api.post(
          `/completion-test/${this.completionId}/question/${questionId}/answer`,
          { answer }
        )
        return response.data
      } catch (error: any) {
        this.handleError(error, 'Failed to submit answer')
        throw error
      } finally {
        this.isSubmitting = false
      }
    },

    async finalizeTest() {
      if (!this.completionId) {
        throw new Error('No completion ID specified')
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await api.post(`/completion-test/${this.completionId}/finalize`)
        this.results = response.data
        return response.data
      } catch (error: any) {
        this.handleError(error, 'Failed to finalize test')
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async startTest(completionId: string) {
      this.reset()
      this.completionId = completionId
      
      try {
        // Fetch test details
        await this.fetchTestDetails(completionId)
        
        // Initialize the test
        await this.initializeTest()
        
        // Get first question ID
        const firstQuestionId = await this.getFirstQuestion()
        
        // Load the first question
        if (firstQuestionId) {
          await this.loadQuestion(firstQuestionId)
        }
        
        return true
      } catch (error) {
        return false
      }
    },

    handleError(error: any, defaultMessage: string) {
      console.error(error)
      this.error = error.response?.data?.detail || defaultMessage
    },

    clearError() {
      this.error = null
    },

    reset() {
      this.completionId = null
      this.textId = null
      this.textTitle = null
      this.currentQuestion = null
      this.isStarted = false
      this.isLoading = false
      this.isSubmitting = false
      this.error = null
      this.results = null
    }
  }
})