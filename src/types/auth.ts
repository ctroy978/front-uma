// src/types/auth.ts

export interface UserRegistration {
    username: string
    email: string
    full_name: string
  }
  
  
  export interface RegisterResponse {
    message: string
    email: string
  }
  



export interface VerificationPayload {
  username: string
  email: string
  verification_code: string
  full_name: string  // Add this field
}

export interface VerificationResponse {
  message: string
  user_id: string
  role: string
  access_token: string
  token_type: string
}
  
  export interface AuthState {
    pendingVerification: UserRegistration | null
    loading: boolean
    error: string | null
    registrationStep: 'initial' | 'verification' | 'complete'
    userId: string | null
    userRole: string | null
  }

  // Add these to existing types/auth.ts

export interface LoginPayload {
  email: string
}

export interface LoginVerificationPayload {
  email: string
  verification_code: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  role: string
  user_id: string
}

export interface AuthTokens {
  access_token: string
  token_type: string
}

export interface AuthUser {
  id: string
  role: string
  email: string
}

// Extend existing AuthState
export interface ExtendedAuthState extends AuthState {
  isAuthenticated: boolean
  tokens: AuthTokens | null
  currentUser: AuthUser | null
  lastActivity: number | null
}

export type AuthErrorType = 
  | 'LOGIN_ERROR'
  | 'VERIFICATION_ERROR'
  | 'TOKEN_ERROR'
  | 'SESSION_ERROR'
  | 'REGISTRATION_ERROR'

export interface AuthError {
  type: AuthErrorType
  message: string
  timestamp: number
}