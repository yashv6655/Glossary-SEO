'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AuthContextType, AuthUser } from '@/lib/auth/types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setUser(session?.user as AuthUser | null)
      setLoading(false)

      // PostHog analytics (if configured)
      if (typeof window !== 'undefined' && session?.user) {
        const email = session.user.email
        const domain = email?.includes('@') ? email.split('@')[1] : undefined
        
        // Optional PostHog tracking
        if (window.posthog) {
          window.posthog.identify(session.user.id, {
            email_domain: domain,
            is_authenticated: true,
          })
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user as AuthUser | null)
      setLoading(false)

      if (typeof window !== 'undefined' && window.posthog) {
        if (session?.user) {
          const email = session.user.email
          const domain = email?.includes('@') ? email.split('@')[1] : undefined
          window.posthog.identify(session.user.id, {
            email_domain: domain,
            is_authenticated: true,
          })
          window.posthog.capture(event === 'SIGNED_IN' ? 'auth_sign_in' : 'auth_event', { event })
        } else {
          window.posthog.capture('auth_sign_out')
          window.posthog.reset()
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const refreshUser = async () => {
    const {
      data: { user: refreshedUser },
    } = await supabase.auth.getUser()
    setUser(refreshedUser as AuthUser | null)
  }

  const value = {
    user,
    loading,
    signOut,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// PostHog type declaration for window
declare global {
  interface Window {
    posthog?: {
      identify: (id: string, props: Record<string, any>) => void
      capture: (event: string, props?: Record<string, any>) => void
      reset: () => void
    }
  }
}