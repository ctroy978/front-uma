// src/stores/student.ts
import { defineStore } from 'pinia'
import api from '@/utils/axios'

interface Teacher {
  id: string
  full_name: string
  text_count: number
}

interface StudentState {
  teachers: Teacher[]
  selectedTeacherId: string | null
  isLoading: boolean
  error: string | null
}

export const useStudentStore = defineStore('student', {
  state: (): StudentState => ({
    teachers: [],
    selectedTeacherId: null,
    isLoading: false,
    error: null
  }),

  getters: {
    selectedTeacher: (state): Teacher | undefined => {
      return state.teachers.find(t => t.id === state.selectedTeacherId)
    },
    
    hasTeachers: (state): boolean => {
      return state.teachers.length > 0
    }
  },

  actions: {
    async fetchTeachers() {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.get('/student/teachers')
        this.teachers = response.data
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to fetch teachers'
        throw error
      } finally {
        this.isLoading = false
      }
    },

  async fetchAssessmentStatus(textId: string) {
    try {
      const response = await api.get(`/assessment/status/${textId}`)
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch assessment status:', error)
      return { has_active_assessment: false, assessment_id: null }
    }
  },

    selectTeacher(teacherId: string) {
      this.selectedTeacherId = teacherId
    },

    clearSelectedTeacher() {
      this.selectedTeacherId = null
    },

    async fetchTeacherTexts(teacherId: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await api.get(`/student/teachers/${teacherId}/texts`)
        return response.data
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to fetch teacher texts'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    resetState() {
      this.teachers = []
      this.selectedTeacherId = null
      this.isLoading = false
      this.error = null
    }
  },
  
})