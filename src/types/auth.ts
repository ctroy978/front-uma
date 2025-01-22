export interface UserRegistration {
    username: string
    email: string
    full_name: string
  }
  
  export interface VerificationPayload {
    username: string
    email: string
    verification_code: string
  }
  
  export interface RegisterResponse {
    message: string
    email: string
  }
  
  export interface VerificationResponse {
    message: string
    user_id: string
    role: string
  }
  
  export interface AuthState {
    pendingVerification: UserRegistration | null
    loading: boolean
    error: string | null
    registrationStep: 'initial' | 'verification' | 'complete'
    userId: string | null
    userRole: string | null
  }