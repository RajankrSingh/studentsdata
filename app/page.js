'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated and redirect accordingly
    const authStatus = localStorage.getItem('isAuthenticated')
    const userType = localStorage.getItem('userType')
    
    if (authStatus === 'true' && userType) {
      if (userType === 'distributor') {
        router.push('/distributor/dashboard')
      } else if (userType === 'school') {
        router.push('/school/dashboard')
      }
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Welcome
          </h1>
          <p className="text-gray-600 text-xl">Choose your login portal</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 animate-slide-up">
          {/* Distributor Login Card */}
          <div className="card hover:scale-105 transition-transform duration-300 cursor-pointer group"
               onClick={() => router.push('/distributor/login')}>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
          <p className="text-gray-600 text-lg">Upload Excel, CSV, or ZIP files securely</p>
        </div>

        {/* Upload Card */}
        <div className="card animate-slide-up">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="file" className="block text-sm font-semibold text-gray-700 mb-3">
                Select File (Excel/CSV/ZIP)
              </label>
              
              {/* Drag and Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 scale-105'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <svg
                    className="w-16 h-16 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <div>
                    <p className="text-gray-700 font-medium">
                      Drag and drop your file here, or
                    </p>
                    <label htmlFor="file" className="text-blue-600 hover:text-blue-700 cursor-pointer font-semibold underline">
                      browse to upload
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">Supports .xls, .xlsx, .csv, .zip files</p>
                </div>
                <input
                  type="file"
                  id="file"
                  name="file"
                  accept=".xls,.xlsx,.csv,.zip"
                  required
                  className="hidden"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Distributor Login</h2>
              <p className="text-gray-600 mb-6">Access your distributor dashboard to manage files and data</p>
              <button className="btn-primary w-full">
                Login as Distributor
                <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>

          {/* School Login Card */}
          <div className="card hover:scale-105 transition-transform duration-300 cursor-pointer group"
               onClick={() => router.push('/school/login')}>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">School Login</h2>
              <p className="text-gray-600 mb-6">Access your school dashboard to view and manage student data</p>
              <button className="btn-primary w-full">
                Login as School
                <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
