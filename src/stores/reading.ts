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

interface SimplifiedTextResponse {
  simplified_text: string
  original_grade_level: number
  target_grade_level: number
  is_cached: boolean
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
  navigationLoading: boolean
  isActive: boolean
  // Simplified text state
  simplifiedText: string | null
  simplifyLoading: boolean
  simplifyError: string | null
  originalGradeLevel: number | null
  targetGradeLevel: number | null
  isTextCached: boolean
}

interface CompletionResponse {
  message: string;
  completion_id: string;
  assessment_id: string;
  text_title: string;
  days_remaining: number;
  completion_triggered_at: string;
}

interface NavigationResult {
  completed: boolean;
  message?: string;
  completion?: CompletionResponse;
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
    isSubmitting: false,
    navigationLoading: false,
    isActive: false,
    // Simplified text state
    simplifiedText: null,
    simplifyLoading: false,
    simplifyError: null,
    originalGradeLevel: null,
    targetGradeLevel: null,
    isTextCached: false
  }),

  getters: {
    hasActiveAssessment: (state): boolean => !!state.assessmentId,
    hasFeedback: (state): boolean => !!state.feedback,
    isAssessmentActive: (state): boolean => state.isActive,
    // New getters
    hasSimplifiedText: (state): boolean => !!state.simplifiedText
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
        this.isActive = true

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
      if (!this.assessmentId) {
        return;
      }
    
      // If we're on the last chunk, trigger completion
      if (!this.currentChunk?.has_next) {
        throw {
          response: {
            status: 400,
            data: { detail: "No next chunk available" }
          }
        };
      }
    
      this.isLoading = true;
      this.error = null;
    
      try {
        const response = await api.get(`/assessment/next/${this.assessmentId}`);
        this.currentChunk = response.data
        
        // Reset question state for new chunk
        this.resetQuestionState()
        
        // Clear simplified text when moving to a new chunk
        this.clearSimplifiedText()
        
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

    async completeAssessment(): Promise<CompletionResponse> {
      if (!this.assessmentId) {
        throw new Error('No active assessment');
      }

      this.navigationLoading = true;
      this.error = null;

      try {
        const response = await api.post<CompletionResponse>(
          `/assessment/${this.assessmentId}/complete`
        );
        
        this.isActive = false;
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to complete assessment';
        throw error;
      } finally {
        this.navigationLoading = false;
      }
    },

    async handleNavigation(): Promise<NavigationResult> {
      if (!this.canProgress) return { completed: false };

      this.navigationLoading = true;
      this.error = null;
      
      try {
        try {
          await this.getNextChunk();
          return { completed: false };
        } catch (error: any) {
          // Check if we're at the last chunk
          if (error.response?.status === 400 && 
              error.response?.data?.detail === "No next chunk available") {
            
            try {
              // Complete the assessment and get completion info
              const completion = await this.completeAssessment();
              
              // Update store state
              this.isActive = false;
              
              // Return completion status with full completion info
              return {
                completed: true,
                message: completion.message,
                completion
              };
            } catch (completionError: any) {
              // Handle completion errors specifically
              throw completionError;
            }
          } else {
            // If it's any other error, throw it
            throw error;
          }
        }
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to navigate';
        throw error;
      } finally {
        this.navigationLoading = false;
      }
    },

    // New methods for simplified text with caching
    async simplifyCurrentChunk() {
      if (!this.assessmentId || !this.currentChunk) {
        this.simplifyError = 'No text available to simplify'
        return
      }

      this.simplifyLoading = true
      this.simplifyError = null
      this.simplifiedText = null
      this.isTextCached = false

      try {
        console.log('Calling API at:', `/simplify/chunk/${this.assessmentId}`);
        const response = await api.get<SimplifiedTextResponse>(
          `/simplify/chunk/${this.assessmentId}`
        )
        
        console.log('API response received:', response.data);
        
        // Set the simplified text data
        this.simplifiedText = response.data.simplified_text
        this.originalGradeLevel = response.data.original_grade_level
        this.targetGradeLevel = response.data.target_grade_level
        this.isTextCached = response.data.is_cached
        
        return response.data
      } catch (error: any) {
        console.error('Error in simplifyCurrentChunk:', error);
        this.simplifyError = error.response?.data?.detail || 'Failed to simplify text'
        throw error
      } finally {
        this.simplifyLoading = false
      }
    },

    clearSimplifiedText() {
      this.simplifiedText = null
      this.simplifyError = null
      this.originalGradeLevel = null
      this.targetGradeLevel = null
      this.isTextCached = false
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
      this.navigationLoading = false  
      this.isActive = false
      // Clear simplified text state
      this.clearSimplifiedText()
    }
  }
})