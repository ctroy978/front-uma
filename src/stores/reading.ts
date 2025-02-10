// src/stores/reading.ts
import { defineStore } from 'pinia'
import api from '@/utils/axios'

// Types
interface Chunk {
  id: string
  content: string
  is_first: boolean
  has_next: boolean
}

interface Question {
  category: string
  question_text: string
  assessment_id: string
}

interface EvaluationResponse {
  is_correct: boolean
  feedback: string
  next_question: Question | null
  can_progress: boolean
}

interface ReadingState {
  assessmentId: string | null
  textTitle: string | null
  currentChunk: Chunk | null
  currentQuestion: Question | null
  isLoading: boolean
  error: string | null
  feedback: string | null
  canProgress: boolean
  isSubmitting: boolean
}

export const useReadingStore = defineStore('reading', {
  state: (): ReadingState => ({
    assessmentId: null,
    textTitle: null,
    currentChunk: null,
    currentQuestion: null,
    isLoading: false,
    error: null,
    feedback: null,
    canProgress: false,
    isSubmitting: false
  }),

  getters: {
    hasActiveAssessment: (state): boolean => !!state.assessmentId,
    hasFeedback: (state): boolean => !!state.feedback
  },

  actions: {
    async startReading(textId: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.post(`/assessment/start/${textId}`)
        const { assessment_id, text_title, chunk } = response.data

        this.assessmentId = assessment_id
        this.textTitle = text_title
        this.currentChunk = chunk

        // Get initial question
        await this.fetchCurrentQuestion()
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to start reading'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async getNextChunk() {
      if (!this.assessmentId || !this.currentChunk?.has_next) {
        return
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await api.get(`/assessment/next/${this.assessmentId}`)
        this.currentChunk = response.data
        
        // Reset question state for new chunk
        this.resetQuestionState()
        
        // Get new question for this chunk
        await this.fetchCurrentQuestion()
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to get next chunk'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async fetchCurrentQuestion() {
      if (!this.assessmentId) return

      this.isLoading = true
      this.error = null

      try {
        const response = await api.get(`/questions/current/${this.assessmentId}`)
        this.currentQuestion = response.data
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to fetch question'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async submitAnswer(answer: string) {
      if (!this.assessmentId || !this.currentQuestion) return

      this.isSubmitting = true
      this.error = null

      try {
        const response = await api.post(`/evaluation/${this.assessmentId}`, {
          answer,
          question: this.currentQuestion.question_text
        })

        const evaluation: EvaluationResponse = response.data

        // Update state based on evaluation
        this.feedback = evaluation.feedback
        this.canProgress = evaluation.can_progress

        // Always update if we get a next question
        if (evaluation.next_question) {
          this.currentQuestion = evaluation.next_question
        }

        return evaluation
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to submit answer'
        throw error
      } finally {
        this.isSubmitting = false
      }
    },

    resetQuestionState() {
      this.currentQuestion = null
      this.feedback = null
      this.canProgress = false
    },

    resetState() {
      this.assessmentId = null
      this.textTitle = null
      this.currentChunk = null
      this.currentQuestion = null
      this.isLoading = false
      this.error = null
      this.feedback = null
      this.canProgress = false
      this.isSubmitting = false
    }
  }
})