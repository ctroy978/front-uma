import { defineStore } from 'pinia'
import axios from 'axios'
import type { 
  UserRegistration, 
  VerificationPayload,
  RegisterResponse,
  VerificationResponse,
  AuthState 
} from '@/types/auth'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    pendingVerification: null,
    loading: false,
    error: null,
    registrationStep: 'initial',
    userId: null,
    userRole: null
  }),

  getters: {
    isVerificationPending: (state) => state.registrationStep === 'verification',
    isRegistrationComplete: (state) => state.registrationStep === 'complete',
    hasError: (state) => state.error !== null
  },

  actions: {
    async initiateRegistration(registration: UserRegistration) {
      this.loading = true
      this.error = null
      
      try {
        const { data } = await axios.post<RegisterResponse>(
          '/auth/register/initiate',
          registration
        )
        
        this.pendingVerification = registration
        this.registrationStep = 'verification'
        localStorage.setItem('pendingVerification', 'true')
        
        return data
      } catch (error) {
        if (axios.isAxiosError(error)) {
          this.error = error.response?.data?.detail || 'Registration failed'
        } else {
          this.error = 'An unexpected error occurred'
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async completeRegistration(verificationCode: string) {
      if (!this.pendingVerification) {
        throw new Error('No pending verification found')
      }

      this.loading = true
      this.error = null

      const payload: VerificationPayload = {
        username: this.pendingVerification.username,
        email: this.pendingVerification.email,
        verification_code: verificationCode
      }

      try {
        const { data } = await axios.post<VerificationResponse>(
          '/auth/register/complete',
          payload
        )

        this.userId = data.user_id
        this.userRole = data.role
        this.registrationStep = 'complete'
        localStorage.removeItem('pendingVerification')

        return data
      } catch (error) {
        if (axios.isAxiosError(error)) {
          this.error = error.response?.data?.detail || 'Verification failed'
        } else {
          this.error = 'An unexpected error occurred'
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    resetRegistration() {
      this.pendingVerification = null
      this.loading = false
      this.error = null
      this.registrationStep = 'initial'
      this.userId = null
      this.userRole = null
      localStorage.removeItem('pendingVerification')
    }
  }
})