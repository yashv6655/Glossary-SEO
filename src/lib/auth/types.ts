import type { User } from '@supabase/supabase-js'

export interface AuthUser extends User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
}

export interface AuthContextType extends AuthState {
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}