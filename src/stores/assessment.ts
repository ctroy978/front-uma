// src/stores/assessment.ts
import { defineStore } from 'pinia'
import api from '@/utils/axios'

// Types
export type QuestionCategory =
  | 'literal_basic'
  | 'literal_detailed'
  | 'vocabulary_context'
  | 'inferential_simple'
  | 'inferential_complex'
  | 'structural_basic'
  | 'structural_advanced'

export type QuestionDifficulty = 'basic' | 'intermediate' | 'advanced'

export interface ChunkInfo {
  id: string
  content: string
  word_count: number
}

export interface Question {
  text: string
  category: QuestionCategory
  difficulty: QuestionDifficulty
}

export interface CategoryMetrics {
  success_rate: number
  attempts: number
}

export interface AssessmentMetrics {
  consecutive_correct: number
  consecutive_incorrect: number
  literal_basic_success: CategoryMetrics
  literal_detailed_success: CategoryMetrics
  vocabulary_success: CategoryMetrics
  inferential_simple_success: CategoryMetrics
  inferential_complex_success: CategoryMetrics
  structural_basic_success: CategoryMetrics
  structural_advanced_success: CategoryMetrics
}

export interface AssessmentState {
  currentAssessmentId: string | null
  currentChunk: ChunkInfo | null
  currentQuestion: Question | null
  metrics: AssessmentMetrics | null
  textId: string | null
  isActive: boolean
  isLoading: boolean
  error: string | null
  lastAnswer: {
    isCorrect: boolean
    feedback: string
  } | null
  completionData: {
    overallScore: number
    totalQuestions: number
    successRates: Record<QuestionCategory, number>
  } | null
}

export const useAssessmentStore = defineStore('assessment', {
  state: (): AssessmentState => ({
    currentAssessmentId: null,
    currentChunk: null,
    currentQuestion: null,
    metrics: null,
    textId: null,
    isActive: false,
    isLoading: false,
    error: null,
    lastAnswer: null,
    completionData: null
  }),

  getters: {
    currentCategory(): QuestionCategory | null {
      return this.currentQuestion?.category || null
    },

    currentDifficulty(): QuestionDifficulty | null {
      return this.currentQuestion?.difficulty || null
    },

    canProgress(): boolean {
      if (!this.metrics || !this.currentCategory) return false

      // Get the current category metrics
      const categoryKey = this.currentCategory.replace('_', '_') as keyof AssessmentMetrics
      const currentMetrics = this.metrics[categoryKey]

      if (!currentMetrics || typeof currentMetrics === 'number') return false

      return (
        this.metrics.consecutive_correct >= 3 &&
        currentMetrics.success_rate >= 75 &&
        currentMetrics.attempts >= 5
      )
    },

    needsRegression(): boolean {
      return this.metrics?.consecutive_incorrect === 3
    }
  },

  actions: {
    async checkAssessmentStatus(textId: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.get(`/student/assessments/${textId}/check`)
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to check assessment status'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async startAssessment(textId: string, forceRestart: boolean = false) {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.post('/student/assessments/start', {
          text_id: textId,
          force_restart: forceRestart
        })

        this.currentAssessmentId = response.data.assessment_id
        this.currentChunk = response.data.current_chunk
        this.currentQuestion = response.data.initial_question
        this.metrics = response.data.status.metrics
        this.textId = textId
        this.isActive = true

        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to start assessment'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async submitAnswer(answerText: string, timeSpentSeconds?: number) {
      if (!this.currentAssessmentId) {
        throw new Error('No active assessment')
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await api.post(
          `/student/assessments/${this.currentAssessmentId}/answer`,
          {
            answer_text: answerText,
            time_spent_seconds: timeSpentSeconds
          }
        )

        // Update state based on response
        this.lastAnswer = {
          isCorrect: response.data.is_correct,
          feedback: response.data.feedback
        }

        if (response.data.assessment_complete) {
          await this.completeAssessment()
        } else {
          if (response.data.next_chunk) {
            this.currentChunk = response.data.next_chunk
          }
          this.currentQuestion = response.data.next_question
          this.metrics = response.data.metrics
        }

        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to submit answer'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async completeAssessment() {
      if (!this.currentAssessmentId) {
        throw new Error('No active assessment')
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await api.post(
          `/student/assessments/${this.currentAssessmentId}/complete`
        )

        this.isActive = false
        this.completionData = {
          overallScore: response.data.final_metrics.overall_score,
          totalQuestions: response.data.final_metrics.total_questions,
          successRates: response.data.final_metrics.success_rates
        }

        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to complete assessment'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async getAssessmentStatus() {
      if (!this.currentAssessmentId) {
        throw new Error('No active assessment')
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await api.get(
          `/student/assessments/${this.currentAssessmentId}/status`
        )
        
        // Update store state with current status
        this.currentChunk = response.data.current_chunk
        this.metrics = response.data.progress_metrics
        this.isActive = response.data.is_active

        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to get assessment status'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    resetState() {
      this.currentAssessmentId = null
      this.currentChunk = null
      this.currentQuestion = null
      this.metrics = null
      this.textId = null
      this.isActive = false
      this.error = null
      this.lastAnswer = null
      this.completionData = null
    }
  }
})