'use client'

import { useRouter, usePathname } from 'next/navigation'

export default function DistributorHeader({ onMenuClick }) {
  const router = useRouter()
  const pathname = usePathname()
  const loginId = typeof window !== 'undefined' ? localStorage.getItem('loginId') : ''

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userType')
    localStorage.removeItem('loginId')
    router.push('/')
  }

  // Generate breadcrumbs based on current path
  const getBreadcrumbs = () => {
    const breadcrumbs = [{ name: 'Home', path: '/distributor/dashboard' }]
    
    if (pathname?.startsWith('/distributor/dashboard')) {
      breadcrumbs.push({ name: 'DashBoard', path: '/distributor/dashboard' })
    } else if (pathname?.startsWith('/distributor/users')) {
      breadcrumbs.push({ name: 'Manage Users / Schools', path: '/distributor/users/list' })
      if (pathname?.includes('/add')) {
        breadcrumbs.push({ name: 'Add User/School', path: '/distributor/users/add' })
      } else if (pathname?.includes('/edit')) {
        breadcrumbs.push({ name: 'Edit User/School', path: pathname })
      }
    } else if (pathname?.startsWith('/distributor/students')) {
      breadcrumbs.push({ name: 'Manage Students', path: '/distributor/students/list' })
      if (pathname?.includes('/import')) {
        breadcrumbs.push({ name: 'Import Students', path: '/distributor/students/import' })
      } else if (pathname?.includes('/add')) {
        breadcrumbs.push({ name: 'Add Student', path: '/distributor/students/add' })
      } else if (pathname?.includes('/edit')) {
        breadcrumbs.push({ name: 'Edit Student', path: pathname })
      }
    } else if (pathname?.startsWith('/distributor/settings')) {
      breadcrumbs.push({ name: 'Settings', path: '/distributor/settings' })
      if (pathname?.includes('/change-password')) {
        breadcrumbs.push({ name: 'Change Password', path: '/distributor/settings/change-password' })
      }
    }
    
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="bg-white border-b border-gray-200/50 px-6 py-4 flex-shrink-0 shadow-sm backdrop-blur-sm bg-white/95">
      <div className="flex items-center justify-between">
        {/* Left Side - Hamburger Menu */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 lg:hidden active:scale-95"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Right Side - User Info and Breadcrumbs */}
        <div className="flex items-center space-x-6 ml-auto">
          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.path} className="flex items-center">
                {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-gray-900 font-semibold px-3 py-1 bg-gray-100 rounded-lg">{crumb.name}</span>
                ) : (
                  <button
                    onClick={() => router.push(crumb.path)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1 rounded-lg transition-all duration-200 font-medium"
                  >
                    {crumb.name}
                  </button>
                )}
              </span>
            ))}
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-blue-100">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900">{loginId || 'Arhan Creation'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 active:scale-95"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

