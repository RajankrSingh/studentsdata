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
      if (pathname?.includes('/add')) {
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
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        {/* Left Side - Hamburger Menu */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Right Side - User Info and Breadcrumbs */}
        <div className="flex items-center space-x-6 ml-auto">
          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.path}>
                {index > 0 && <span className="mx-2">/</span>}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-gray-900 font-medium">{crumb.name}</span>
                ) : (
                  <button
                    onClick={() => router.push(crumb.path)}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {crumb.name}
                  </button>
                )}
              </span>
            ))}
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-300">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{loginId || 'Arhan Creation'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

