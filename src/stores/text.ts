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

interface TextUpdateData {
    metadata: {
        grade_level: number;
        form: TextForm;
        primary_type: PrimaryType;
        genres: Set<Genre>;
    };
    content: string;
}


export interface ActiveAssessmentInfo {
    count: number;
    student_names: string[];
}



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

        async fetchText(id: string) {
            this.isLoading = true
            this.error = null

            try {
                const response = await api.get(`/teacher/texts/${id}`)
                this.selectedText = response.data.text
                return response.data
            } catch (error: any) {
                this.error = error.response?.data?.detail || 'Failed to fetch text'
                throw error
            } finally {
                this.isLoading = false
            }
        },

        async createText(payload: CreateTextPayload) {
            this.isLoading = true
            this.error = null

            try {
                const formData = new FormData()
                formData.append('content', payload.content)
                formData.append('text_data', JSON.stringify(payload.metadata))

                const response = await api.post<Text>('/teacher/texts', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })

                this.texts.push(response.data)
                return response.data
            } catch (error: any) {
                this.error = error.response?.data?.detail || 'Failed to create text'
                throw error
            } finally {
                this.isLoading = false
            }
        },

        // New method to check active assessments
        async checkActiveAssessments(id: string): Promise<ActiveAssessmentInfo> {
            try {
                const response = await api.get(`/teacher/texts/${id}/active-assessments`)
                return response.data
            } catch (error: any) {
                this.error = error.response?.data?.detail || 'Failed to check active assessments'
                throw error
            }
        },

        // method to update text

        async updateText(id: string, content: string, force: boolean = false) {
            this.isLoading = true
            this.error = null

            try {
                // Create FormData for multipart request
                const formData = new FormData()
                formData.append('content', content)
                formData.append('force', force.toString())

                const response = await api.put<Text>(`/teacher/texts/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })

                // Update text in state
                const index = this.texts.findIndex(t => t.id === id)
                if (index !== -1) {
                    this.texts[index] = response.data
                }

                return response.data
            } catch (error: any) {
                this.error = error.response?.data?.detail || 'Failed to update text'
                throw error
            } finally {
                this.isLoading = false
            }
        },

        

        setFilters(filters: Partial<TextState['filters']>) {
            this.filters = {
                ...this.filters,
                ...filters
            }
        },

        resetFilters() {
            this.filters = {
                grade_level: null,
                form: null,
                type: null,
                genre: null
            }
        },

        selectText(text: Text | null) {
            this.selectedText = text
        },

        resetState() {
            this.texts = []
            this.selectedText = null
            this.isLoading = false
            this.error = null
            this.resetFilters()
        },
        
        
        
                async deleteText(id: string, force: boolean = false) {
                    this.isLoading = true
                    this.error = null
        
                    try {
                        await api.delete(`/teacher/texts/${id}`, {
                            params: { force }
                        })
                        
                        // Remove from local state
                        this.texts = this.texts.filter(t => t.id !== id)
                    } catch (error: any) {
                        // Special handling for 409 Conflict (active assessments)
                        if (error.response?.status === 409) {
                            throw error.response.data
                        }
                        this.error = error.response?.data?.detail || 'Failed to delete text'
                        throw error
                    } finally {
                        this.isLoading = false
                    }
                }
            }
        })
