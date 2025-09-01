'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'

export function UserMenu() {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/auth/login">Sign in</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/auth/register">Sign up</Link>
        </Button>
      </div>
    )
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsOpen(false)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const userInitials = user.email?.charAt(0).toUpperCase() || 'U'
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-2"
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary-100 text-primary-700 text-sm font-medium">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <span className="hidden md:inline text-sm font-medium text-gray-700">
          {displayName}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-soft-lg z-20 py-1">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-600">{user.email}</p>
            </div>
            
            <div className="py-1">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="h-4 w-4 mr-3" />
                Dashboard
              </Link>
              
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </Link>
            </div>
            
            <div className="border-t border-gray-100 py-1">
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}