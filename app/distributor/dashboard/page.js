'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/app/components/AuthGuard'
import DistributorLayout from '@/app/components/DistributorLayout'

export default function DistributorDashboard() {
  const router = useRouter()
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalStudents, setTotalStudents] = useState(0)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [isLoadingStudents, setIsLoadingStudents] = useState(true)

  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const response = await fetch('/api/users/count')
        const result = await response.json()
        
        if (result.success) {
          setTotalUsers(result.count)
        } else {
          console.error('Error fetching users count:', result.error)
          setTotalUsers(0)
        }
      } catch (error) {
        console.error('Error fetching users count:', error)
        setTotalUsers(0)
      } finally {
        setIsLoadingUsers(false)
      }
    }

    const fetchTotalStudents = async () => {
      try {
        const response = await fetch('/api/students/count')
        const result = await response.json()
        
        if (result.success) {
          setTotalStudents(result.count)
        } else {
          console.error('Error fetching students count:', result.error)
          setTotalStudents(0)
        }
      } catch (error) {
        console.error('Error fetching students count:', error)
        setTotalStudents(0)
      } finally {
        setIsLoadingStudents(false)
      }
    }

    fetchTotalUsers()
    fetchTotalStudents()
  }, [])

  return (
    <AuthGuard requiredUserType="distributor">
      <DistributorLayout>
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">DashBoard</h1>
        </div>

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Total Users/Schools Card */}
          <div className="bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                {isLoadingUsers ? (
                  <div className="h-12 w-24 bg-cyan-400 rounded animate-pulse"></div>
                ) : (
                  <h2 className="text-4xl font-bold">{totalUsers.toLocaleString()}</h2>
                )}
                <p className="text-cyan-100 mt-2 text-lg">Total Users/Schools</p>
              </div>
              <div className="w-12 h-12 bg-cyan-400 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <button 
              onClick={() => router.push('/distributor/users/list')}
              className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>View all</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Total Students Card */}
          <div className="bg-green-500 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                {isLoadingStudents ? (
                  <div className="h-12 w-24 bg-green-400 rounded animate-pulse"></div>
                ) : (
                  <h2 className="text-4xl font-bold">{totalStudents.toLocaleString()}</h2>
                )}
                <p className="text-green-100 mt-2 text-lg">Total Students</p>
              </div>
              <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <button 
              onClick={() => router.push('/distributor/students/list')}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>View all</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </DistributorLayout>
    </AuthGuard>
  )
}
