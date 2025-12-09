'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/app/components/AuthGuard'
import DownloadButton from '@/app/components/DownloadButton'

export default function SchoolDashboard() {
  const [files, setFiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loginId, setLoginId] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Get login ID from localStorage
    const storedLoginId = localStorage.getItem('loginId')
    if (storedLoginId) {
      setLoginId(storedLoginId)
    }

    // Fetch files
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files')
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files || [])
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDateFromFileName = (fileName) => {
    const match = fileName.match(/-(\d+)\./)
    if (!match) return 'N/A'
    
    try {
      const timestamp = parseInt(match[1])
      const date = new Date(timestamp)
      return date.toLocaleString()
    } catch {
      return 'N/A'
    }
  }

  return (
    <AuthGuard requiredUserType="school">
      <div className="min-h-screen p-4 md:p-8 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      School Dashboard
                    </h1>
                    {loginId && (
                      <p className="text-gray-600 text-sm">Welcome, {loginId}</p>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 text-lg">
                  {isLoading 
                    ? 'Loading files...' 
                    : files.length === 0 
                    ? 'No files available' 
                    : `${files.length} file${files.length !== 1 ? 's' : ''} available`}
                </p>
              </div>
              <button
                onClick={fetchFiles}
                className="btn-secondary flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Files List */}
          {isLoading ? (
            <div className="card text-center py-16 animate-slide-up">
              <div className="flex flex-col items-center space-y-4">
                <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600">Loading files...</p>
              </div>
            </div>
          ) : files.length === 0 ? (
            <div className="card text-center py-16 animate-slide-up">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No files available</h3>
                  <p className="text-gray-500">Files will appear here once uploaded by distributors</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card overflow-hidden animate-slide-up">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b-2 border-indigo-200">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        File Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Uploaded At
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {files.map((file, index) => (
                      <tr
                        key={file.name}
                        className="table-row"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{file.name}</div>
                              <div className="text-xs text-gray-500">
                                {file.metadata?.size 
                                  ? `${(file.metadata.size / 1024).toFixed(2)} KB`
                                  : file.size 
                                  ? `${(file.size / 1024).toFixed(2)} KB`
                                  : 'Size unknown'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">
                            {formatDateFromFileName(file.name)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <DownloadButton fileName={file.name} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}

