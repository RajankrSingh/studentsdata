'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/app/components/AuthGuard'
import DistributorLayout from '@/app/components/DistributorLayout'

export default function AddUserPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    distributor: '',
    name: '',
    email: '',
    password: '',
    mobileNo: '',
    address: '',
    userSchoolCode: '',
    status: 'Active'
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Get distributor name from localStorage
    const loginId = typeof window !== 'undefined' ? localStorage.getItem('loginId') : ''
    setFormData(prev => ({
      ...prev,
      distributor: loginId || 'Arhan Creation'
    }))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
      if (!validTypes.includes(file.type)) {
        alert('Please select a JPEG, JPG, or PNG file only.')
        e.target.value = ''
        return
      }
      
      // Validate file size (500 KB = 500 * 1024 bytes)
      const maxSize = 500 * 1024
      if (file.size > maxSize) {
        alert('Image size should be less than 500 KB.')
        e.target.value = ''
        return
      }
      
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // First, create the user
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save user data')
      }

      // If photo is selected, upload it
      if (selectedFile && result.data?.id) {
        const formDataPhoto = new FormData()
        formDataPhoto.append('photo', selectedFile)
        formDataPhoto.append('userId', result.data.id)

        try {
          const photoResponse = await fetch('/api/users/upload-photo', {
            method: 'POST',
            body: formDataPhoto
          })

          if (!photoResponse.ok) {
            console.warn('User created but photo upload failed')
          }
        } catch (photoError) {
          console.error('Error uploading photo:', photoError)
          // Don't fail the whole operation if photo upload fails
        }
      }

      alert('User/School added successfully!')
      router.push('/distributor/users/list')
    } catch (error) {
      console.error('Error saving user:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthGuard requiredUserType="distributor">
      <DistributorLayout>
        <div className="mb-6 flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Add User/School</h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add User/School</span>
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Distributor */}
              <div className="flex flex-col">
                <label htmlFor="distributor" className="block text-sm font-semibold text-gray-700 mb-2">
                  Distributor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="distributor"
                  name="distributor"
                  value={formData.distributor}
                  readOnly
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed shadow-sm"
                />
              </div>

              {/* Name */}
              <div className="flex flex-col">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter Name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:shadow-md"
                  required
                />
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Email"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:shadow-md"
                  required
                />
              </div>

              {/* Password */}
              <div className="flex flex-col">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter Password"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:shadow-md"
                  required
                />
              </div>

              {/* Mobile No */}
              <div className="flex flex-col">
                <label htmlFor="mobileNo" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile No <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="mobileNo"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  placeholder="Enter Mobile No"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:shadow-md"
                  required
                />
              </div>

              {/* User/School Code */}
              <div className="flex flex-col">
                <label htmlFor="userSchoolCode" className="block text-sm font-semibold text-gray-700 mb-2">
                  User/School Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="userSchoolCode"
                  name="userSchoolCode"
                  value={formData.userSchoolCode}
                  onChange={handleChange}
                  placeholder="Auto-generated if left empty"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:shadow-md"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2 flex flex-col">
                <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter Address"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:shadow-md"
                  required
                />
              </div>

              {/* Upload Photo */}
              <div className="md:col-span-2 flex flex-col">
                <label htmlFor="photo" className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Photo <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      id="photo"
                      name="photo"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>Choose file</span>
                    </div>
                  </label>
                  <div className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-gray-600 min-h-[48px] flex items-center">
                    {selectedFile ? selectedFile.name : 'No file chosen'}
                  </div>
                </div>
                <p className="mt-2 text-sm text-red-600 font-medium">
                  Note:- JPEG, JPG, PNG FILES ONLY. MAX IMAGE SIZE SHOULD BE LESS THAN 500 KB
                </p>
              </div>

              {/* Status */}
              <div className="flex flex-col">
                <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 shadow-sm hover:shadow-md"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t-2 border-gray-100 flex justify-start">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
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
      </DistributorLayout>
    </AuthGuard>
  )
}

