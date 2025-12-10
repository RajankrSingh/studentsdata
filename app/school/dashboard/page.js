'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/app/components/AuthGuard'
import SchoolLayout from '@/app/components/SchoolLayout'

export default function SchoolDashboard() {
  const router = useRouter()
  const [totalStudents, setTotalStudents] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTotalStudents = async () => {
      try {
        // Get email/loginId from localStorage (preferred) or userId as fallback
        const email = typeof window !== 'undefined' ? localStorage.getItem('loginId') : null
        const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
        
        if (!email && !userId) {
          console.error('Email/LoginId or User ID not found in localStorage')
          setTotalStudents(0)
          setIsLoading(false)
          return
        }

        // Use email if available, otherwise use userId
        const queryParam = email ? `email=${encodeURIComponent(email)}` : `schoolId=${userId}`

        // Add cache-busting to ensure fresh data
        const response = await fetch(`/api/students/count?${queryParam}&t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        const result = await response.json()
        
        console.log('Student count API response:', result)
        
        if (result.success) {
          setTotalStudents(result.count || 0)
        } else {
          console.error('Error fetching student count:', result.error)
          setTotalStudents(0)
        }
      } catch (error) {
        console.error('Error fetching student count:', error)
        setTotalStudents(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTotalStudents()
    
    // Refresh count when page becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchTotalStudents()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <AuthGuard requiredUserType="school">
      <SchoolLayout>
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your students.</p>
        </div>

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Students Card */}
          <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-2xl hover:shadow-green-500/30 transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  {isLoading ? (
                    <div className="h-14 w-32 bg-white/20 rounded-xl animate-pulse"></div>
                  ) : (
                    <h2 className="text-5xl font-bold mb-2 drop-shadow-lg">{totalStudents.toLocaleString()}</h2>
                  )}
                  <p className="text-green-50 text-xl font-semibold">Total Students</p>
                </div>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={async () => {
                    setIsLoading(true)
                    try {
                      const email = typeof window !== 'undefined' ? localStorage.getItem('loginId') : null
                      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
                      if (email || userId) {
                        const queryParam = email ? `email=${encodeURIComponent(email)}` : `schoolId=${userId}`
                        const response = await fetch(`/api/students/count?${queryParam}&t=${Date.now()}`, {
                          cache: 'no-store'
                        })
                        const result = await response.json()
                        if (result.success) {
                          setTotalStudents(result.count || 0)
                        }
                      }
                    } catch (error) {
                      console.error('Error refreshing count:', error)
                    } finally {
                      setIsLoading(false)
                    }
                  }}
                  className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  title="Refresh count"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </button>
                <button 
                  onClick={() => router.push('/school/students/list')}
                  className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <span>View all</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* More widgets can be added here */}
        </div>
      </SchoolLayout>
    </AuthGuard>
  )
}
