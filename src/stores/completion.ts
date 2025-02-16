// src/stores/completion.ts
import { defineStore } from 'pinia'
import api from '@/utils/axios'

interface CompletionTest {
  id: string
  text_title: string
  triggered_at: string
  days_remaining: number
  test_status: string
}

interface CompletionState {
  completions: CompletionTest[]
  isLoading: boolean
  error: string | null
}

export const useCompletionStore = defineStore('completion', {
  state: (): CompletionState => ({
    completions: [],
    isLoading: false,
    error: null
  }),

  getters: {
    hasAvailableCompletions: (state) => state.completions.length > 0,
    sortedByDate: (state) => [...state.completions].sort((a, b) => 
      new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime()
    )
  },

  actions: {
    async fetchAvailableCompletions() {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.get('/student/completion/completions/available')
        this.completions = response.data.completions
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to fetch completion tests'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async startCompletionTest(completionId: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.post(`/student/completion/${completionId}/start`)
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to start completion test'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    clearError() {
      this.error = null
    },

    resetState() {
      this.completions = []
      this.isLoading = false
      this.error = null
    }
  }
})