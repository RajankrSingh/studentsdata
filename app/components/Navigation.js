'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      {/* Company Name */}
      {/* <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold">Your Company Name</h2>
        </div>
      </div> */}
      
      {/* Navigation Links */}
      {/* <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              pathname === '/'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            Upload
          </Link>
          <Link
            href="/files"
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              pathname === '/files'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            Files
          </Link>
        </div>
      </div> */}
    </nav>
  )
}

