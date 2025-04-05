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
  category?: string
  question_text: string
  assessment_id: string
  is_pre_question?: boolean
  from_cache?: boolean
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
  textId: string | null
  textTitle: string | null
  currentChunk: Chunk | null
  currentChunkPosition: number
  totalChunks: number
  
  // Pre-question state
  preQuestion: Question | null
  preQuestionCorrect: boolean
  preFeedback: string | null
  preAnswerSubmitted: boolean
  
  // Main question state
  mainQuestion: Question | null
  mainQuestionCorrect: boolean
  mainFeedback: string | null
  mainAnswerSubmitted: boolean
  
  // Loading and error states
  isLoading: boolean
  isPreQuestionLoading: boolean
  isMainQuestionLoading: boolean
  error: string | null
  navigationLoading: boolean
  isActive: boolean
  isSubmittingPre: boolean
  isSubmittingMain: boolean
  
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
    textId: null,
    textTitle: null,
    currentChunk: null,
    currentChunkPosition: 1,
    totalChunks: 0,
    
    // Pre-question state
    preQuestion: null,
    preQuestionCorrect: false,
    preFeedback: null,
    preAnswerSubmitted: false,
    
    // Main question state
    mainQuestion: null,
    mainQuestionCorrect: false,
    mainFeedback: null,
    mainAnswerSubmitted: false,
    
    // Loading and error states
    isLoading: false,
    isPreQuestionLoading: false,
    isMainQuestionLoading: false,
    error: null,
    navigationLoading: false,
    isActive: false,
    isSubmittingPre: false,
    isSubmittingMain: false,
    
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
    isAssessmentActive: (state): boolean => state.isActive,
    hasSimplifiedText: (state): boolean => !!state.simplifiedText,
    
    // Navigation conditions
    canProgress: (state): boolean => {
      return state.preQuestionCorrect && state.mainQuestionCorrect;
    },
    
    // Question status getters
    hasPreQuestion: (state): boolean => !!state.preQuestion,
    hasMainQuestion: (state): boolean => !!state.mainQuestion,
    isMainQuestionEnabled: (state): boolean => state.preQuestionCorrect,
    
    // Loading states
    isAnyLoading: (state): boolean => 
      state.isLoading || 
      state.isPreQuestionLoading || 
      state.isMainQuestionLoading ||
      state.isSubmittingPre ||
      state.isSubmittingMain
  },

  actions: {
    async fetchCurrentPosition(textId: string, chunkId: string) {
      try {
        const positionResponse = await api.get(
          `/assessment/text/${textId}/chunk-position/${chunkId}`
        );
        this.currentChunkPosition = positionResponse.data.position || 1;
        return positionResponse.data.position;
      } catch (error) {
        console.error("Failed to get chunk position:", error);
        // Don't update position on error - keep existing value
        return null;
      }
    },
    async startReading(textId: string) {
      this.isLoading = true;
      this.error = null;
    
      try {
        // Start the assessment
        const response = await api.post(`/assessment/start/${textId}`);
        const { assessment_id, text_title, chunk } = response.data;
    
        this.assessmentId = assessment_id;
        this.textId = textId; // Store the textId
        this.textTitle = text_title;
        this.currentChunk = chunk;
        this.isActive = true;
        
        // Get total chunks count
        try {
          const chunkResponse = await api.get(`/assessment/text/${textId}/chunks`);
          this.totalChunks = chunkResponse.data.total_chunks || 0;
        } catch (chunkError) {
          console.error("Failed to get chunk count:", chunkError);
          this.totalChunks = 0;
        }
        
        // Get current chunk position from API
        if (chunk && chunk.id) {
          await this.fetchCurrentPosition(textId, chunk.id);
        }
        
        // Fetch both questions
        await this.fetchPreQuestion();
        await this.fetchMainQuestion();
        
        return { success: true };
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to start reading';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async getNextChunk() {
      if (!this.assessmentId || !this.textId) {
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
        this.currentChunk = response.data;
        
        // Get current chunk position from API instead of incrementing
        if (this.currentChunk && this.currentChunk.id) {
          await this.fetchCurrentPosition(this.textId, this.currentChunk.id);
        }
        
        // Reset all question states for the new chunk
        this.resetQuestionState();
        
        // Clear simplified text when moving to a new chunk
        this.clearSimplifiedText();
        
        // Fetch both questions for the new chunk
        await this.fetchPreQuestion();
        await this.fetchMainQuestion();
        
        return { success: true };
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to get next chunk';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchPreQuestion() {
      if (!this.assessmentId) return;

      this.isPreQuestionLoading = true;
      this.error = null;

      try {
        const response = await api.get(`/questions/pre-question/${this.assessmentId}`);
        this.preQuestion = {
          ...response.data,
          is_pre_question: true
        };
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to fetch pre-question';
        throw error;
      } finally {
        this.isPreQuestionLoading = false;
      }
    },

    async fetchMainQuestion() {
      if (!this.assessmentId) return;

      this.isMainQuestionLoading = true;
      this.error = null;

      try {
        const response = await api.get(`/questions/current/${this.assessmentId}`);
        this.mainQuestion = {
          ...response.data,
          is_pre_question: false
        };
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to fetch main question';
        throw error;
      } finally {
        this.isMainQuestionLoading = false;
      }
    },

    async submitPreAnswer(answer: string) {
      if (!this.assessmentId || !this.preQuestion) return;

      this.isSubmittingPre = true;
      this.error = null;

      try {
        const response = await api.post(`/evaluation/${this.assessmentId}`, {
          answer,
          question: this.preQuestion.question_text,
          is_pre_question: true
        });

        const evaluation: EvaluationResponse = response.data;

        // Update feedback
        this.preFeedback = evaluation.feedback;
        this.preAnswerSubmitted = true;
        
        // Set pre-question correctness
        if (evaluation.is_correct) {
          this.preQuestionCorrect = true;
          
          // If the API returned a new main question, update it
          if (evaluation.next_question && !evaluation.next_question.is_pre_question) {
            this.mainQuestion = evaluation.next_question;
          }
        } else {
          // If incorrect, we might get a new pre-question
          if (evaluation.next_question && evaluation.next_question.is_pre_question) {
            this.preQuestion = evaluation.next_question;
          }
        }

        return evaluation;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to submit pre-question answer';
        throw error;
      } finally {
        this.isSubmittingPre = false;
      }
    },

    async submitMainAnswer(answer: string) {
      if (!this.assessmentId || !this.mainQuestion) return;

      this.isSubmittingMain = true;
      this.error = null;

      try {
        const response = await api.post(`/evaluation/${this.assessmentId}`, {
          answer,
          question: this.mainQuestion.question_text,
          is_pre_question: false
        });

        const evaluation: EvaluationResponse = response.data;

        // Update feedback
        this.mainFeedback = evaluation.feedback;
        this.mainAnswerSubmitted = true;
        
        // Set main question correctness
        if (evaluation.is_correct) {
          this.mainQuestionCorrect = true;
        } else {
          // If we got a new question, update it
          if (evaluation.next_question && !evaluation.next_question.is_pre_question) {
            this.mainQuestion = evaluation.next_question;
          }
        }

        return evaluation;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to submit main question answer';
        throw error;
      } finally {
        this.isSubmittingMain = false;
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
      // Check if the student can progress to the next chunk
      if (!this.canProgress) {
        console.log('Cannot navigate: Requirements not met');
        return { completed: false };
      }

      console.log('All navigation conditions met, proceeding...');
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

    // Simplified text methods
    async simplifyCurrentChunk() {
      if (!this.assessmentId || !this.currentChunk) {
        this.simplifyError = 'No text available to simplify';
        return;
      }

      this.simplifyLoading = true;
      this.simplifyError = null;
      this.simplifiedText = null;
      this.isTextCached = false;

      try {
        const response = await api.get<SimplifiedTextResponse>(
          `/simplify/chunk/${this.assessmentId}`
        );
        
        // Set the simplified text data
        this.simplifiedText = response.data.simplified_text;
        this.originalGradeLevel = response.data.original_grade_level;
        this.targetGradeLevel = response.data.target_grade_level;
        this.isTextCached = response.data.is_cached;
        
        return response.data;
      } catch (error: any) {
        this.simplifyError = error.response?.data?.detail || 'Failed to simplify text';
        throw error;
      } finally {
        this.simplifyLoading = false;
      }
    },

    clearSimplifiedText() {
      this.simplifiedText = null;
      this.simplifyError = null;
      this.originalGradeLevel = null;
      this.targetGradeLevel = null;
      this.isTextCached = false;
    },

    resetQuestionState() {
      // Reset pre-question state
      this.preQuestion = null;
      this.preQuestionCorrect = false;
      this.preFeedback = null;
      this.preAnswerSubmitted = false;
      
      // Reset main question state
      this.mainQuestion = null;
      this.mainQuestionCorrect = false;
      this.mainFeedback = null;
      this.mainAnswerSubmitted = false;
    },

    resetState() {
      this.assessmentId = null;
      this.textTitle = null;
      this.currentChunk = null;
      this.currentChunkPosition = 1;
      this.totalChunks = 0;
      
      // Reset question states
      this.resetQuestionState();
      
      // Reset loading and error states
      this.isLoading = false;
      this.textId = null;
      this.isPreQuestionLoading = false;
      this.isMainQuestionLoading = false;
      this.error = null;
      this.navigationLoading = false;
      this.isActive = false;
      this.isSubmittingPre = false;
      this.isSubmittingMain = false;
      
      // Clear simplified text state
      this.clearSimplifiedText();
    }
  }
})