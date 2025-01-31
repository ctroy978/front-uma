// src/stores/text.ts
import { defineStore } from 'pinia'
import api from '../utils/axios'
import type { 
    Text, 
    TextState, 
    CreateTextPayload,
    TextForm,
    PrimaryType,
    Genre 
} from '../types/text'

export const useTextStore = defineStore('text', {
    state: (): TextState => ({
        texts: [],
        selectedText: null,
        isLoading: false,
        error: null,
        filters: {
            grade_level: null,
            form: null,
            type: null,
            genre: null
        }
    }),

    getters: {
        filteredTexts: (state): Text[] => {
            let filtered = [...state.texts]

            if (state.filters.grade_level) {
                filtered = filtered.filter(text => 
                    text.grade_level === state.filters.grade_level
                )
            }

            if (state.filters.form) {
                filtered = filtered.filter(text => 
                    text.form === state.filters.form
                )
            }

            if (state.filters.type) {
                filtered = filtered.filter(text => 
                    text.primary_type === state.filters.type
                )
            }

            if (state.filters.genre) {
                filtered = filtered.filter(text => 
                    text.genres.includes(state.filters.genre!)
                )
            }

            return filtered
        },

        getTextById: (state) => (id: string): Text | undefined => {
            return state.texts.find(text => text.id === id)
        }
    },

    actions: {
        // Fetch all texts for the current teacher
        async fetchTexts() {
            this.isLoading = true
            this.error = null

            try {
                const response = await api.get<Text[]>('/teacher/texts')
                this.texts = response.data
            } catch (error: any) {
                this.error = error.response?.data?.detail || 'Failed to fetch texts'
                throw error
            } finally {
                this.isLoading = false
            }
        },

        // Create a new text
        async createText(payload: CreateTextPayload) {
            this.isLoading = true
            this.error = null

            try {
                // Create FormData for multipart request
                const formData = new FormData()
                formData.append('content', payload.content)
                formData.append('text_data', JSON.stringify(payload.metadata))

                const response = await api.post<Text>('/teacher/texts', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })

                // Add new text to state
                this.texts.push(response.data)
                return response.data
            } catch (error: any) {
                this.error = error.response?.data?.detail || 'Failed to create text'
                throw error
            } finally {
                this.isLoading = false
            }
        },

        // Set filters
        setFilters(filters: Partial<TextState['filters']>) {
            this.filters = {
                ...this.filters,
                ...filters
            }
        },

        // Reset filters
        resetFilters() {
            this.filters = {
                grade_level: null,
                form: null,
                type: null,
                genre: null
            }
        },

        // Select a text for editing/viewing
        selectText(text: Text | null) {
            this.selectedText = text
        },

        // Reset store state
        resetState() {
            this.texts = []
            this.selectedText = null
            this.isLoading = false
            this.error = null
            this.resetFilters()
        }
    }
})