
'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import posthog from 'posthog-js'

// PostHog type declaration for window
declare global {
  interface Window {
    posthog?: any
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: 'https://app.posthog.com',
        // Enable debug mode in development
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') posthog.debug()
        },
      })
    }
  }, [])

  useEffect(() => {
    if (user?.id && user?.email) {
      const email = user.email
      const domain = email?.includes('@') ? email.split('@')[1] : undefined
      
      posthog.identify(user.id, {
        email: user.email,
        email_domain: domain,
      })
    } else {
      posthog.reset()
    }
  }, [user])

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      posthog.capture('$pageview', {
        $current_url: url,
      })
    }
  }, [pathname, searchParams])

  return children
}
