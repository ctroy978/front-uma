// src/stores/reading.ts
import { defineStore } from 'pinia'
import api from '@/utils/axios'

interface Chunk {
    id: string;
    content: string;
    is_first: boolean;
    has_next: boolean;
}

interface Question {
    category: string;
    question_text: string;
    assessment_id: string;
}

interface ReadingState {
    currentChunk: Chunk | null;
    currentQuestion: Question | null;
    textTitle: string;
    assessmentId: string | null;
    isLoading: boolean;
    error: string | null;
}

export const useReadingStore = defineStore('reading', {
    state: (): ReadingState => ({
        currentChunk: null,
        currentQuestion: null,
        textTitle: '',
        assessmentId: null,
        isLoading: false,
        error: null
    }),

    actions: {
        async startReading(textId: string) {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await api.post(`/assessment/start/${textId}`);
                this.currentChunk = response.data.chunk;
                this.textTitle = response.data.text_title;
                this.assessmentId = response.data.assessment_id;
                
                // Get initial question
                await this.fetchCurrentQuestion();
            } catch (error: any) {
                this.error = error.response?.data?.detail || 'Failed to start reading';
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async getNextChunk() {
            if (!this.assessmentId || !this.currentChunk?.has_next) {
                this.error = 'No more chunks available';
                return;
            }

            this.isLoading = true;
            this.error = null;

            try {
                const response = await api.get(`/assessment/next/${this.assessmentId}`);
                this.currentChunk = response.data;
                
                // Get question for new chunk
                await this.fetchCurrentQuestion();
            } catch (error: any) {
                this.error = error.response?.data?.detail || 'Failed to fetch next chunk';
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async fetchCurrentQuestion() {
            if (!this.assessmentId) {
                this.error = 'No active assessment';
                return;
            }

            try {
                const response = await api.get(`/questions/current/${this.assessmentId}`);
                this.currentQuestion = response.data;
            } catch (error: any) {
                this.error = error.response?.data?.detail || 'Failed to fetch question';
                throw error;
            }
        },

        async submitAnswer(isCorrect: boolean) {
            if (!this.assessmentId) {
                this.error = 'No active assessment';
                return;
            }

            try {
                const response = await api.post('/questions/answer', {
                    assessment_id: this.assessmentId,
                    is_correct: isCorrect
                });
                this.currentQuestion = response.data;
            } catch (error: any) {
                this.error = error.response?.data?.detail || 'Failed to submit answer';
                throw error;
            }
        },

        resetState() {
            this.currentChunk = null;
            this.currentQuestion = null;
            this.textTitle = '';
            this.assessmentId = null;
            this.isLoading = false;
            this.error = null;
        }
    }
});