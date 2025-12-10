'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/app/components/AuthGuard'
import DistributorLayout from '@/app/components/DistributorLayout'

export default function DistributorListStudentsPage() {
  const router = useRouter()
  const [distributor, setDistributor] = useState('')
  const [selectedSchoolId, setSelectedSchoolId] = useState('')
  const [selectedBatch, setSelectedBatch] = useState('')
  const [schools, setSchools] = useState([])
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isDownloadingImages, setIsDownloadingImages] = useState(false)
  const [showEntries, setShowEntries] = useState(100)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRows, setSelectedRows] = useState([])

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

  const handleSearch = async () => {
    if (!selectedSchoolId) {
      alert('Please select a User/School first')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Get the selected school's email for filtering
      const selectedSchool = schools.find(s => s.id === Number(selectedSchoolId))
      const schoolEmail = selectedSchool?.email || null
      
      console.log('Searching with:', {
        selectedSchoolId,
        schoolEmail,
        selectedBatch,
        school: selectedSchool
      })
      
      // Use email if available for more accurate matching, otherwise use schoolId
      const params = new URLSearchParams()
      
      // Always pass schoolId for direct filtering, email is optional for verification
      params.append('schoolId', selectedSchoolId)
      if (schoolEmail) {
        params.append('email', schoolEmail)
      }
      
      // Add batch if selected (optional)
      if (selectedBatch) {
        params.append('batch', selectedBatch)
      }
      
      console.log('API URL:', `/api/students?${params.toString()}`)
      const response = await fetch(`/api/students?${params.toString()}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Response Error:', response.status, errorText)
        let errorMessage = 'Failed to fetch students'
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorMessage
        } catch (e) {
          errorMessage = errorText || errorMessage
        }
        alert(errorMessage)
        setStudents([])
        setIsLoading(false)
        return
      }
      
      const result = await response.json()
      console.log('API Response:', result)
      
      if (result.success && result.data) {
        // Update serial numbers based on filtered results
        const studentsWithSrNo = (result.data || []).map((student, index) => ({
          ...student,
          srNo: index + 1
        }))
        
        console.log('Students loaded:', studentsWithSrNo.length)
        setStudents(studentsWithSrNo)
        
        if (studentsWithSrNo.length === 0) {
          alert('No students found for the selected school and batch.')
        }
      } else {
        console.error('API Error:', result.error || 'Unknown error')
        alert(result.error || 'Error loading students data')
        setStudents([])
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      alert('Error loading students data')
      setStudents([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(students.map(s => s.id))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id))
    } else {
      setSelectedRows([...selectedRows, id])
    }
  }

  const handleViewPhoto = (student) => {
    if (student.photoUrl) {
      // Open photo in new window
      window.open(student.photoUrl, '_blank')
    } else {
      alert('No photo available for this student')
    }
  }

  const handleEdit = (student) => {
    router.push(`/distributor/students/edit?id=${student.id}&batch=${selectedBatch}&schoolId=${selectedSchoolId}`)
  }

  const handleUploadPhoto = (student) => {
    // Create a file input element
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return

      const formData = new FormData()
      formData.append('photo', file)
      formData.append('studentId', student.id)

      try {
        const response = await fetch('/api/students/upload-photo', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to upload photo')
        }

        // Update local state
        setStudents(students.map(s => 
          s.id === student.id 
            ? { ...s, imageUploaded: true, imageName: result.data.photoName, photoUrl: result.data.photoUrl }
            : s
        ))
        alert('Photo uploaded successfully!')
      } catch (error) {
        console.error('Error uploading photo:', error)
        alert(`Error: ${error.message}`)
      }
    }
    input.click()
  }

  const handleDelete = async (student) => {
    if (!confirm(`Are you sure you want to delete ${student.studentName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete student')
      }

      // Remove from local state
      const updatedStudents = students
        .filter(s => s.id !== student.id)
        .map((s, index) => ({ ...s, srNo: index + 1 }))
      
      setStudents(updatedStudents)
      alert(`${student.studentName} deleted successfully!`)
    } catch (error) {
      console.error('Error deleting student:', error)
      alert(`Error: ${error.message}`)
    }
  }

  const handleChangeStatus = () => {
    if (selectedRows.length === 0) {
      alert('Please select at least one student')
      return
    }
    // TODO: Implement status change API
    alert(`Changing status to "Ready to Print" for ${selectedRows.length} student(s)`)
  }

  const handleExportBatch = async () => {
    if (students.length === 0) {
      alert('No students to export')
      return
    }

    if (!selectedSchoolId) {
      alert('Please select a User/School first')
      return
    }

    setIsExporting(true)
    try {
      // Get the selected school's email for filtering
      const selectedSchool = schools.find(s => s.id === Number(selectedSchoolId))
      const schoolEmail = selectedSchool?.email || null
      
      const params = new URLSearchParams()
      
      if (schoolEmail) {
        params.append('email', schoolEmail)
      } else {
        params.append('schoolId', selectedSchoolId)
      }
      
      // Add batch if selected (optional)
      if (selectedBatch) {
        params.append('batch', selectedBatch)
      }
      
      const response = await fetch(`/api/students/export?${params.toString()}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to export')
      }

      // Get the CSV content
      const csvContent = await response.text()
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `students_batch_${selectedBatch}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      alert('Batch records exported successfully!')
    } catch (error) {
      console.error('Error exporting batch:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadBatchImages = async () => {
    if (students.length === 0) {
      alert('No students to download images from')
      return
    }

    if (!selectedSchoolId) {
      alert('Please select a User/School first')
      return
    }
    
    const studentsWithPhotos = students.filter(s => s.photoUrl)
    if (studentsWithPhotos.length === 0) {
      alert('No students with photos to download')
      return
    }

    setIsDownloadingImages(true)
    try {
      // Use JSZip library
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      // Download each image and add to ZIP
      let downloaded = 0
      let failed = 0

      for (const student of studentsWithPhotos) {
        try {
          const response = await fetch(student.photoUrl)
          if (response.ok) {
            const blob = await response.blob()
            // Create a better filename
            const fileExtension = student.photoUrl.split('.').pop()?.split('?')[0] || 'jpg'
            const sanitizedName = (student.studentName || 'student').replace(/[^a-zA-Z0-9]/g, '_')
            const fileName = student.imageName || student.photoName || `${student.admissionNo || student.id}_${sanitizedName}.${fileExtension}`
            zip.file(fileName, blob)
            downloaded++
          } else {
            console.warn(`Failed to download photo for ${student.studentName}: ${response.statusText}`)
            failed++
          }
        } catch (error) {
          console.error(`Error downloading photo for ${student.studentName}:`, error)
          failed++
        }
      }

      if (downloaded === 0) {
        alert('Failed to download any images. Please check if photos are accessible.')
        return
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      })
      
      const url = window.URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      const batchLabel = selectedBatch ? `batch_${selectedBatch}_` : ''
      a.download = `students_images_${batchLabel}${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      if (failed > 0) {
        alert(`Downloaded ${downloaded} images. ${failed} failed.`)
      } else {
        alert(`Successfully downloaded ${downloaded} images as ZIP!`)
      }
    } catch (error) {
      console.error('Error downloading batch images:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsDownloadingImages(false)
    }
  }

  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase()
    return (
      student.studentName?.toLowerCase().includes(query) ||
      student.fatherName?.toLowerCase().includes(query) ||
      student.mobileNo?.includes(query) ||
      student.admissionNo?.toLowerCase().includes(query) ||
      student.class?.toLowerCase().includes(query)
    )
  })

  return (
    <AuthGuard requiredUserType="distributor">
      <DistributorLayout>
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b-2 border-blue-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Manage Students</h1>
            </div>
            <button
              onClick={() => router.push('/distributor/students/add')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Student</span>
            </button>
          </div>

          {/* Filter Section */}
          <div className="px-8 py-6 bg-gradient-to-br from-gray-50 to-blue-50 border-b-2 border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:items-end">
              {/* Distributor */}
              <div>
                <label htmlFor="distributor" className="block text-sm font-bold text-gray-700 mb-2">
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
                <label htmlFor="userSchool" className="block text-sm font-bold text-gray-700 mb-2">
                  Select User/School <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="userSchool"
                    name="userSchool"
                    value={selectedSchoolId}
                    onChange={(e) => setSelectedSchoolId(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 appearance-none cursor-pointer shadow-sm hover:shadow-md"
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

              {/* Batch */}
              <div>
                <label htmlFor="batch" className="block text-sm font-bold text-gray-700 mb-2">
                  Select Batch <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <select
                    id="batch"
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 appearance-none cursor-pointer shadow-sm hover:shadow-md"
                  >
                    {/* <option value="">Select Batch</option>
                    <option value="BATCH-6">BATCH-6</option>
                    <option value="BATCH-5">BATCH-5</option>
                    <option value="BATCH-4">BATCH-4</option> */}
                    <option value="2024-25">2024-25</option>
                    <option value="2023-24">2023-24</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="mt-4">
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transform hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          {students.length > 0 && (
            <div className="px-8 py-4 bg-gradient-to-r from-yellow-50 to-green-50 border-b-2 border-gray-100 flex flex-wrap gap-3">
              <button
                onClick={() => router.back()}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to previous screen</span>
              </button>
              <button
                onClick={handleChangeStatus}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Change status to &apos;Ready to Print&apos;</span>
              </button>
              <button
                onClick={handleExportBatch}
                disabled={isExporting}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export Batch Records</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadBatchImages}
                disabled={isDownloadingImages}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloadingImages ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download Batch Images in Zip</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Table Controls */}
          {students.length > 0 && (
            <div className="px-8 py-4 bg-white border-b-2 border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 font-semibold">Show</span>
                <select
                  value={showEntries}
                  onChange={(e) => setShowEntries(Number(e.target.value))}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 shadow-sm hover:shadow-md transition-shadow"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-700 font-semibold">entries</span>
              </div>
              <div className="flex items-center space-x-2">
                <label htmlFor="search" className="text-sm text-gray-700 font-semibold flex items-center space-x-1">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search:</span>
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students..."
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 shadow-sm hover:shadow-md transition-shadow w-64"
                />
              </div>
            </div>
          )}

          {/* Students Table */}
          {students.length === 0 ? (
            <div className="p-12 min-h-[400px] flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-gray-600 mb-2">No students found</p>
              <p className="text-sm text-gray-500">Select a User/School and Batch, then click Search to view students</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Sr No</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedRows.length === students.length && students.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Image Uploaded</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Image Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Student Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Father Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Mobile No</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Address</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Class</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Session</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Admission No</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Blood Group</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Card Batch</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredStudents.map((student, index) => (
                    <tr key={student.id} className={`transition-all duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50 hover:shadow-sm`}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{student.srNo}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(student.id)}
                          onChange={() => handleSelectRow(student.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {student.imageUploaded ? (
                          <div className="flex flex-col items-start space-y-1">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <button 
                              onClick={() => handleViewPhoto(student)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                            >
                              View Photo
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{student.imageName || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{student.studentName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{student.fatherName || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{student.mobileNo || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{student.address || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{student.class}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{student.session}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{student.admissionNo || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{student.bloodGroup || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{student.cardBatch || student.session}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col space-y-1.5">
                          <button 
                            onClick={() => handleEdit(student)}
                            className="bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleUploadPhoto(student)}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                          >
                            Upload Photo
                          </button>
                          <button 
                            onClick={() => handleDelete(student)}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer Info */}
          {students.length > 0 && (
            <div className="px-8 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-t-2 border-gray-100 text-sm text-gray-700 font-medium">
              <div className="flex items-center justify-between">
                <span>Showing <span className="font-bold text-blue-600">{filteredStudents.length}</span> of <span className="font-bold text-gray-900">{students.length}</span> entries</span>
              </div>
            </div>
          )}
        </div>
      </DistributorLayout>
    </AuthGuard>
  )
}

