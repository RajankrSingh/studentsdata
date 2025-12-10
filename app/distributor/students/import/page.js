'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/app/components/AuthGuard'
import DistributorLayout from '@/app/components/DistributorLayout'

export default function ImportStudentsPage() {
  const router = useRouter()
  const [distributor, setDistributor] = useState('')
  const [selectedSchoolId, setSelectedSchoolId] = useState('')
  const [schools, setSchools] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Get distributor name from localStorage
    const loginId = typeof window !== 'undefined' ? localStorage.getItem('loginId') : ''
    setDistributor(loginId || 'Arhan Creation')
    
    // Fetch schools/users
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/users')
      const result = await response.json()
      
      if (result.success) {
        setSchools(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching schools:', error)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const fileName = file.name.toLowerCase()
      const isValidFile = fileName.endsWith('.csv') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')
      if (!isValidFile) {
        alert('Please select a CSV or Excel file (.csv, .xlsx, .xls)')
        e.target.value = ''
        return
      }
      setSelectedFile(file)
    }
  }

  const handleDownloadSample = () => {
    // Create sample CSV content
    const sampleCSV = `Student Name,Father Name,Mobile No,Address,Class,Session,Admission No,Blood Group
John Doe,Robert Doe,1234567890,123 Main St,10th,2024-2025,ADM001,A+
Jane Smith,Michael Smith,0987654321,456 Oak Ave,9th,2024-2025,ADM002,B+`

    // Create blob and download
    const blob = new Blob([sampleCSV], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample_students.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedSchoolId) {
      alert('Please select a User/School')
      return
    }
    
    if (!selectedFile) {
      alert('Please select a CSV or Excel file')
      return
    }

    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('schoolId', selectedSchoolId)
      formData.append('distributor', distributor)

      const response = await fetch('/api/students/import', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import students')
      }

      alert(`Successfully imported ${result.imported || 0} students!`)
      router.push('/distributor/students/list')
    } catch (error) {
      console.error('Error importing students:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthGuard requiredUserType="distributor">
      <DistributorLayout>
        <div className="mb-6 flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Import Students</h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 px-8 py-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Import Students</span>
            </h2>
            <button
              onClick={handleDownloadSample}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              Download Sample File
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Distributor */}
              <div>
                <label htmlFor="distributor" className="block text-sm font-semibold text-gray-700 mb-2">
                  Distributor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="distributor"
                  name="distributor"
                  value={distributor}
                  readOnly
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed shadow-sm"
                />
              </div>

              {/* User/School */}
              <div>
                <label htmlFor="userSchool" className="block text-sm font-semibold text-gray-700 mb-2">
                  User/School <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="userSchool"
                    name="userSchool"
                    value={selectedSchoolId}
                    onChange={(e) => setSelectedSchoolId(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 appearance-none cursor-pointer shadow-sm hover:shadow-md"
                    required
                  >
                    <option value="">Select User/School</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name} ({school.userSchoolCode || school.email})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Upload CSV/Excel File */}
              <div className="md:col-span-2">
                <label htmlFor="fileInput" className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload CSV or Excel File <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      id="fileInput"
                      name="fileInput"
                      accept=".csv,.xlsx,.xls"
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
                  <div className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-gray-600">
                    {selectedFile ? selectedFile.name : 'No file chosen'}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t-2 border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto md:min-w-[200px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Importing...
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

