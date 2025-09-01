import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export interface AuthResult {
  user: User | null
  error: string | null
}

export async function getApiUser(): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      return { user: null, error: error.message }
    }

    return { user, error: null }
  } catch {
    return { user: null, error: 'Authentication check failed' }
  }
}

export async function requireApiAuth(): Promise<{ user: User; error?: never } | { user?: never; error: string }> {
  const { user, error } = await getApiUser()
  
  if (!user || error) {
    return { error: error || 'Authentication required' }
  }
  
  return { user }
}