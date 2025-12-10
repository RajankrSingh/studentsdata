'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SchoolLogin() {
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if already authenticated as school
    const authStatus = localStorage.getItem('isAuthenticated')
    const userType = localStorage.getItem('userType')
    
    if (authStatus === 'true' && userType === 'school') {
      router.push('/school/dashboard')
    }
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validate email and password
    if (!email.trim()) {
      setError('Please enter your email address')
      setIsLoading(false)
      return
    }

    if (!password.trim()) {
      setError('Please enter your password')
      setIsLoading(false)
      return
    }

    try {
      // Call login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        }),
      })

      // Check if response is JSON
      let result
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        result = await response.json()
      } else {
        const text = await response.text()
        throw new Error(`Server error: ${text || 'Invalid response format'}`)
      }

      if (!response.ok) {
        // Check for token-related errors in the response
        const errorMsg = result.error || 'Login failed'
        if (errorMsg.includes('token') || errorMsg.includes('Token') || errorMsg.includes('authentication')) {
          throw new Error('Authentication service error. Please contact administrator.')
        }
        throw new Error(errorMsg)
      }

      if (result.success && result.user) {
        // Store authentication and user data
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('userType', 'school')
        localStorage.setItem('loginId', result.user.email)
        localStorage.setItem('userId', result.user.id.toString())
        localStorage.setItem('userName', result.user.name)
        localStorage.setItem('userSchoolCode', result.user.userSchoolCode || '')
        
        // Redirect to school dashboard
        router.push('/school/dashboard')
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error('Login error:', error)
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Network error. Please check your internet connection and try again.')
      } else if (error.message && (error.message.includes('token') || error.message.includes('Token') || error.message.includes('authentication'))) {
        setError('Authentication service error. Please try again or contact administrator.')
      } else {
        setError(error.message || 'Invalid email or password. Please try again.')
      }
      
      setPassword('')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full max-w-md">
        <div className="card animate-slide-up">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              School Login
            </h1>
            <p className="text-gray-600">Enter your credentials to access the school dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
                placeholder="Enter your email address"
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border-2 border-red-200 text-red-800 rounded-lg flex items-center space-x-2 animate-fade-in">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

