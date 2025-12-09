'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'

export default function SchoolSidebar({ isOpen }) {
  const pathname = usePathname()
  const router = useRouter()
  const loginId = typeof window !== 'undefined' ? localStorage.getItem('loginId') : ''
  const [manageStudentsOpen, setManageStudentsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Check if we're on any student-related page to auto-expand
  useEffect(() => {
    if (pathname?.startsWith('/school/students')) {
      setManageStudentsOpen(true)
    }
    if (pathname?.startsWith('/school/settings')) {
      setSettingsOpen(true)
    }
  }, [pathname])

  const menuItems = [
    {
      name: 'DashBoard',
      path: '/school/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Manage Students',
      path: '/school/students',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      hasArrow: true,
      submenu: [
        { name: 'Add Student', path: '/school/students/add' },
        { name: 'List Students', path: '/school/students/list' },
      ],
    },
    {
      name: 'Settings',
      path: '/school/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      hasArrow: true,
      submenu: [
        { name: 'Change Password', path: '/school/settings/change-password' },
      ],
    },
  ]

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 bg-gray-800 text-white z-30 transition-transform duration-300 lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-700 flex-shrink-0">
          <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-900" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-sm font-medium">{loginId || 'School Name'}</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const isActive = pathname === item.path
            const isManageStudents = item.name === 'Manage Students'
            const isSettings = item.name === 'Settings'
            const isSubmenuActive = item.submenu?.some(sub => pathname === sub.path)
            
            return (
              <div key={item.name}>
                <button
                  onClick={() => {
                    if (isManageStudents) {
                      setManageStudentsOpen(!manageStudentsOpen)
                    } else if (isSettings) {
                      setSettingsOpen(!settingsOpen)
                    } else {
                      router.push(item.path)
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    isActive || isSubmenuActive
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {item.hasArrow && (
                    <svg 
                      className={`w-4 h-4 transition-transform ${
                        (isManageStudents && manageStudentsOpen) || (isSettings && settingsOpen) 
                          ? 'rotate-180' : ''
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
                
                {/* Submenu for Manage Students */}
                {isManageStudents && manageStudentsOpen && item.submenu && (
                  <div className="mt-2 ml-4 space-y-1">
                    {item.submenu.map((subItem) => {
                      const isSubActive = pathname === subItem.path
                      return (
                        <button
                          key={subItem.path}
                          onClick={() => router.push(subItem.path)}
                          className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                            isSubActive
                              ? 'bg-gray-700 text-white'
                              : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                          }`}
                        >
                          <div className="w-2 h-2 rounded-full border border-current"></div>
                          <span>{subItem.name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
                
                {/* Submenu for Settings */}
                {isSettings && settingsOpen && item.submenu && (
                  <div className="mt-2 ml-4 space-y-1">
                    {item.submenu.map((subItem) => {
                      const isSubActive = pathname === subItem.path
                      return (
                        <button
                          key={subItem.path}
                          onClick={() => router.push(subItem.path)}
                          className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                            isSubActive
                              ? 'bg-gray-700 text-white'
                              : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                          }`}
                        >
                          <div className="w-2 h-2 rounded-full border border-current"></div>
                          <span>{subItem.name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

