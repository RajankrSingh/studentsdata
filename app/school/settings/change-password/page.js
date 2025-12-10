'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/app/components/AuthGuard'
import SchoolLayout from '@/app/components/SchoolLayout'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required'
    }
    
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }
    
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Get user ID from localStorage
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
      
      if (!userId) {
        alert('User ID not found. Please login again.')
        setIsSubmitting(false)
        return
      }

      const response = await fetch('/api/settings/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to change password')
      }

      alert('Password changed successfully!')
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error changing password:', error)
      alert(`Error: ${error.message || 'Failed to change password. Please try again.'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthGuard requiredUserType="school">
      <SchoolLayout>
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-2xl">
          {/* Header */}
          <div className="bg-gray-700 px-8 py-4">
            <h2 className="text-xl font-bold text-white">Change Password</h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-bold text-gray-700 mb-2">
                Current Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter Current Password"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 ${
                  errors.currentPassword
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                required
              />
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-bold text-gray-700 mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter New Password"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 ${
                  errors.newPassword
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                required
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Enter Confirm Password"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                required
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </form>
        </div>
      </SchoolLayout>
    </AuthGuard>
  )
}

