'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/auth/UserMenu'
import { useAuth } from '@/components/providers/auth-provider'
import { BookOpen, Github } from 'lucide-react'

export function Header() {
  const { user, loading } = useAuth()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">
                DevGlossary
              </span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            {isMounted && user && (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/import" 
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Import
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
              </Link>
            </Button>
            
            {isMounted && !loading && (
              user ? (
                <UserMenu />
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/auth/login">Sign in</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/auth/register">Get Started</Link>
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
