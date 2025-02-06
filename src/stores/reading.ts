// src/stores/reading.ts
import { defineStore } from 'pinia'
import api from '@/utils/axios'

interface Chunk {
    id: string;
    content: string;
    is_first: boolean;
    has_next: boolean;
}

interface ReadingState {
    currentChunk: Chunk | null;
    assessmentId: string | null;
    isLoading: boolean;
    error: string | null;
}

export const useReadingStore = defineStore('reading', {
    state: (): ReadingState => ({
        currentChunk: null,
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
                this.assessmentId = response.data.assessment_id;
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
            } catch (error: any) {
                this.error = error.response?.data?.detail || 'Failed to fetch next chunk';
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        resetState() {
            this.currentChunk = null;
            this.assessmentId = null;
            this.isLoading = false;
            this.error = null;
        }
    }
})