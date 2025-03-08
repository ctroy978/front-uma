import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../stores/auth'
import type { AuthError, AuthErrorType } from '../types/auth'

// Custom interface to include _retry property
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Create axios instance with custom config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Track if we're refreshing to prevent multiple refresh calls
let isRefreshing = false
// Store pending requests to retry after refresh
let pendingRequests: Array<{
  config: CustomAxiosRequestConfig
  resolve: (value: any) => void
  reject: (error: any) => void
}> = []

// Helper to create typed auth errors
const createAuthError = (type: AuthErrorType, message: string): AuthError => ({
  type,
  message,
  timestamp: Date.now()
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (_error) => {
    return Promise.reject(
      createAuthError('TOKEN_ERROR', 'Failed to attach authentication token')
    )
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const authStore = useAuthStore()
    const originalRequest = error.config as CustomAxiosRequestConfig
    
    // Don't retry refresh token requests to avoid infinite loops
    if (originalRequest.url?.includes('/auth/token/refresh')) {
      await authStore.logout()
      return Promise.reject(
        createAuthError('TOKEN_ERROR', 'Token refresh failed')
      )
    }

    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // If we're already refreshing, queue this request
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            pendingRequests.push({ config: originalRequest, resolve, reject })
          })
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        } catch (error) {
          return Promise.reject(error)
        }
      }

      // Start refresh process
      isRefreshing = true

      try {
        const response = await authStore.refreshToken()
        const newToken = response.access_token

        // Update the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`

        // Process pending requests with new token
        pendingRequests.forEach(({ config, resolve }) => {
          config.headers.Authorization = `Bearer ${newToken}`
          resolve(api(config))
        })

        return api(originalRequest)
      } catch (refreshError) {
        // Handle refresh failure
        pendingRequests.forEach(({ reject }) => {
          reject(
            createAuthError('TOKEN_ERROR', 'Token refresh failed')
          )
        })
        authStore.cleanup() // Use cleanup instead of full logout
        return Promise.reject(
          createAuthError('SESSION_ERROR', 'Session expired')
        )
      } finally {
        isRefreshing = false
        pendingRequests = []
      }
    }

    // Handle 403 Forbidden errors
    if (error.response && error.response.status === 403) {
      return Promise.reject(
        createAuthError('VERIFICATION_ERROR', 'Access forbidden')
      )
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject(
        createAuthError('LOGIN_ERROR', 'Network error occurred')
      )
    }

    // Handle other errors
    return Promise.reject(error)
  }
)

export default api