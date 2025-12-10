'use client'

import { useState, useEffect } from 'react'
import SchoolSidebar from './SchoolSidebar'
import SchoolHeader from './SchoolHeader'
import SchoolFooter from './SchoolFooter'

export default function SchoolLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Set sidebar to open by default on larger screens
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <SchoolSidebar isOpen={sidebarOpen} />
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-72 w-full overflow-hidden">
        {/* Header */}
        <SchoolHeader onMenuClick={toggleSidebar} />
        
        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
        
        {/* Footer */}
        <SchoolFooter />
      </div>
    </div>
  )
}

