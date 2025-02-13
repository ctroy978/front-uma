// src/stores/auth.ts
import { defineStore } from 'pinia'
import axios from 'axios'
import { useRouter } from 'vue-router'
import api from '../utils/axios'


import type { 
  UserRegistration, 
  VerificationPayload,
  RegisterResponse,
  VerificationResponse,
  ExtendedAuthState,
  LoginPayload,
  LoginVerificationPayload,
  LoginResponse,
  LogoutResponse,
} from '@/types/auth'

export const useAuthStore = defineStore('auth', {
  state: (): ExtendedAuthState => ({
    // Existing registration state
    pendingVerification: null,
    loading: false,
    error: null,
    registrationStep: 'initial',
    userId: null,
    userRole: null,

    // New authentication state
    isAuthenticated: false,
    tokens: null,
    currentUser: null,
    lastActivity: null
  }),

  getters: {
    // Existing getters
    isVerificationPending: (state) => state.registrationStep === 'verification',
    isRegistrationComplete: (state) => state.registrationStep === 'complete',
    hasError: (state) => state.error !== null,

    // New getters
    isLoggedIn: (state) => state.isAuthenticated && !!state.tokens?.access_token,
    hasRole: (state) => (role: string) => state.currentUser?.role === role,
    canAccess: (state) => (roles: string[]) => 
      state.currentUser?.role ? roles.includes(state.currentUser.role) : false,
    sessionActive: (state) => {
      if (!state.lastActivity) return false
      const inactiveTime = Date.now() - state.lastActivity
      return inactiveTime < 30 * 60 * 1000 // 30 minutes
    }
  },

  actions: {
    // Existing registration actions
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
        verification_code: verificationCode,
        full_name: this.pendingVerification.full_name
      }
    
      try {
        const { data } = await axios.post<VerificationResponse>(
          '/auth/register/complete',
          payload
        )
    
        // Set authentication data using the tokens from response
        this.setAuthenticationData({
          access_token: data.access_token,
          token_type: data.token_type,
          user_id: data.user_id,
          role: data.role
        })
    
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

    // New authentication actions
    async initiateLogin(payload: LoginPayload) {
      this.loading = true
      this.error = null

      try {
        const { data } = await axios.post<RegisterResponse>(
          '/auth/login/initiate',
          payload
        )
        
        localStorage.setItem('pendingLoginVerification', 'true')
        localStorage.setItem('pendingLoginEmail', payload.email)
        
        return data
      } catch (error) {
        if (axios.isAxiosError(error)) {
          this.error = error.response?.data?.detail || 'Login initiation failed'
        } else {
          this.error = 'An unexpected error occurred'
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async completeLogin(verificationCode: string) {
      const email = localStorage.getItem('pendingLoginEmail')
      if (!email) {
        throw new Error('No pending login verification found')
      }

      this.loading = true
      this.error = null

      const payload: LoginVerificationPayload = {
        email,
        verification_code: verificationCode
      }

      try {
        const { data } = await axios.post<LoginResponse>(
          '/auth/login/verify',
          payload
        )

        this.setAuthenticationData(data)
        this.updateLastActivity()
        
        localStorage.removeItem('pendingLoginVerification')
        localStorage.removeItem('pendingLoginEmail')

        return data
      } catch (error) {
        if (axios.isAxiosError(error)) {
          this.error = error.response?.data?.detail || 'Login verification failed'
        } else {
          this.error = 'An unexpected error occurred'
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    setAuthenticationData(data: LoginResponse) {
      this.tokens = {
        access_token: data.access_token,
        token_type: data.token_type
      }
      
      this.currentUser = {
        id: data.user_id,
        role: data.role,
        email: localStorage.getItem('pendingLoginEmail') || ''
      }
      
      this.isAuthenticated = true
      this.lastActivity = Date.now()

      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(this.currentUser))
    },

    updateLastActivity() {
      this.lastActivity = Date.now()
    },

    async refreshToken() {
      try {
        const { data } = await axios.post<LoginResponse>('/auth/token/refresh')
        this.tokens = {
          access_token: data.access_token,
          token_type: data.token_type
        }
        localStorage.setItem('token', data.access_token)
        return data
      } catch (error) {
        await this.logout()
        throw error
      }
    },

    async logout() {
      this.loading = true;
      
      try {
        // Configure axios to not reject on any status code for logout
        const response = await api.post<LogoutResponse>('/auth/logout', {}, {
          validateStatus: (status) => true // Accept any status code
        });
        
        // Log non-200 responses but don't throw
        if (response.status !== 200) {
          console.warn('Logout API warning:', response.status, response.data);
        }
      } catch (error) {
        // Only log network/connection errors
        console.error('Logout network error:', error);
      } finally {
        // Always perform cleanup
        this.cleanup();
        this.loading = false;
        
        // Force navigation to login
        const router = useRouter();
        router.push({ name: 'login' });
      }
    },

    clearAuthenticationData() {
      // Clear authentication state
      this.isAuthenticated = false
      this.tokens = null
      this.currentUser = null
      this.lastActivity = null

      // Clear local storage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('pendingLoginVerification')
      localStorage.removeItem('pendingLoginEmail')
    },

    resetRegistration() {
      this.pendingVerification = null
      this.loading = false
      this.error = null
      this.registrationStep = 'initial'
      this.userId = null
      this.userRole = null
      localStorage.removeItem('pendingVerification')
    },

    initialize() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
    
      if (token && token !== 'undefined' && user) {
        try {
          const userData = JSON.parse(user)
          this.tokens = {
            access_token: token,
            token_type: 'Bearer'
          }
          this.currentUser = userData
          this.isAuthenticated = true
          this.lastActivity = Date.now()
        } catch (error) {
          // If there's any error parsing or invalid data, clear everything
          this.clearAuthenticationData()
        }
      } else {
        // If token is undefined or missing, clear everything
        this.clearAuthenticationData()
      }
    },
    // Add after initialize() method
    cleanup() {
      // Clear authentication state
      this.isAuthenticated = false
      this.tokens = null
      this.currentUser = null
      this.lastActivity = null
      this.pendingVerification = null
      this.loading = false
      this.error = null
      this.registrationStep = 'initial'
      this.userId = null
      this.userRole = null

      // Clear local storage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('pendingLoginVerification')
      localStorage.removeItem('pendingLoginEmail')
      localStorage.removeItem('pendingVerification')
    },
    clearAuthCookies() {
      // Clear cookies by setting expired date
      const pastDate = new Date(0).toUTCString();
      document.cookie = 'refresh_token=; expires=' + pastDate + '; path=/; secure; samesite=lax';
    },

  }
}
)