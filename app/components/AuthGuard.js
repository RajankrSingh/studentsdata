'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthGuard({ children, requiredUserType }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('isAuthenticated')
    const userType = localStorage.getItem('userType')
    
    if (authStatus === 'true') {
      // If a specific user type is required, check it matches
      if (requiredUserType && userType !== requiredUserType) {
        // User type doesn't match, redirect to appropriate login
        if (requiredUserType === 'distributor') {
          router.push('/distributor/login')
        } else if (requiredUserType === 'school') {
          router.push('/school/login')
        } else {
          router.push('/')
        }
        setIsAuthenticated(false)
      } else {
        setIsAuthenticated(true)
      }
    } else {
      // Not authenticated, redirect to appropriate login
      if (requiredUserType === 'distributor') {
        router.push('/distributor/login')
      } else if (requiredUserType === 'school') {
        router.push('/school/login')
      } else {
        router.push('/')
      }
      setIsAuthenticated(false)
    }
    setIsLoading(false)
  }, [requiredUserType, router])

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userType')
    localStorage.removeItem('loginId')
    setIsAuthenticated(false)
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
          title="Logout"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </>
  )
}

