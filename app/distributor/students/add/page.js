'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/app/components/AuthGuard'
import DistributorLayout from '@/app/components/DistributorLayout'

export default function DistributorAddStudentPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // Step 1: Select school, Step 2: Add student form
  const [distributor, setDistributor] = useState('')
  const [selectedSchoolId, setSelectedSchoolId] = useState('')
  const [selectedSchool, setSelectedSchool] = useState(null)
  const [schools, setSchools] = useState([])
  const [formData, setFormData] = useState({
    studentName: '',
    fatherName: '',
    mobileNo: '',
    address: '',
    class: '',
    session: '',
    admissionNo: '',
    bloodGroup: ''
  })
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

  const handleSchoolSelect = (e) => {
    e.preventDefault()
    if (!selectedSchoolId) {
      alert('Please select a User/School')
      return
    }
    
    const school = schools.find(s => s.id === Number(selectedSchoolId))
    if (school) {
      setSelectedSchool(school)
      setStep(2) // Move to student form
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          schoolId: selectedSchoolId,
          distributor: distributor
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save student data')
      }

      alert('Student added successfully!')
      
      // Reset form and go back to step 1
      setFormData({
        studentName: '',
        fatherName: '',
        mobileNo: '',
        address: '',
        class: '',
        session: '',
        admissionNo: '',
        bloodGroup: ''
      })
      setStep(1)
      setSelectedSchoolId('')
      setSelectedSchool(null)
    } catch (error) {
      console.error('Error saving student:', error)
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Add Student</h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Student</span>
            </h2>
          </div>

          {/* Step 1: Select School */}
          {step === 1 && (
            <form onSubmit={handleSchoolSelect} className="p-8">
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
              </div>

              {/* Submit Button */}
              <div className="mt-8 pt-6 border-t-2 border-gray-100">
                <button
                  type="submit"
                  className="w-full md:w-auto md:min-w-[200px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Submit
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Student Form */}
          {step === 2 && (
            <>
              {/* School Info Banner */}
              <div className="px-8 pt-6">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Selected School:</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedSchool?.name}</p>
                  </div>
                  <button
                    onClick={() => {
                      setStep(1)
                      setSelectedSchoolId('')
                      setSelectedSchool(null)
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Change School
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student Name */}
                  <div className="md:col-span-2">
                    <label htmlFor="studentName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Student Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="studentName"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleChange}
                      placeholder="Enter Student Name"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:shadow-md"
                      required
                    />
                  </div>

                  {/* Father Name */}
                  <div>
                    <label htmlFor="fatherName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Father Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fatherName"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      placeholder="Enter Father Name"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:shadow-md"
                      required
                    />
                  </div>

                  {/* Mobile No */}
                  <div>
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

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter Address"
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 resize-none shadow-sm hover:shadow-md"
                      required
                    />
                  </div>

                  {/* Class */}
                  <div>
                    <label htmlFor="class" className="block text-sm font-semibold text-gray-700 mb-2">
                      Class <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="class"
                      name="class"
                      value={formData.class}
                      onChange={handleChange}
                      placeholder="Enter Class"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:shadow-md"
                      required
                    />
                  </div>

                  {/* Session */}
                  <div>
                    <label htmlFor="session" className="block text-sm font-semibold text-gray-700 mb-2">
                      Session <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="session"
                      name="session"
                      value={formData.session}
                      onChange={handleChange}
                      placeholder="Enter Session"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:shadow-md"
                      required
                    />
                  </div>

                  {/* Admission No */}
                  <div>
                    <label htmlFor="admissionNo" className="block text-sm font-semibold text-gray-700 mb-2">
                      Admission No <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="admissionNo"
                      name="admissionNo"
                      value={formData.admissionNo}
                      onChange={handleChange}
                      placeholder="Enter Admission No"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:shadow-md"
                      required
                    />
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label htmlFor="bloodGroup" className="block text-sm font-semibold text-gray-700 mb-2">
                      Blood Group <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="bloodGroup"
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      placeholder="Enter Blood Group"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:shadow-md"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8 pt-6 border-t-2 border-gray-100 flex gap-4">
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
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1)
                      setSelectedSchoolId('')
                      setSelectedSchool(null)
                    }}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Back
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </DistributorLayout>
    </AuthGuard>
  )
}
