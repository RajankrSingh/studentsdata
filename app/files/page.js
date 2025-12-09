import { createServerClient } from '@/lib/supabaseClient'
import DownloadButton from '@/app/components/DownloadButton'
import RefreshButton from './RefreshButton'
import AuthGuard from '../components/AuthGuard'

export const dynamic = 'force-dynamic'
export const revalidate = 0 // Always fetch fresh data
export const fetchCache = 'force-no-store' // Don't cache fetch requests

async function getFiles() {
  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    // During build time or when env vars aren't set, return empty array
    // This prevents build failures while still allowing the page to render
    if (process.env.NODE_ENV === 'development') {
      console.warn('Supabase environment variables not configured. Add them to .env.local')
    }
    return []
  }

  try {
    const supabase = createServerClient()
    
    const { data, error } = await supabase.storage
      .from('uploads')
      .list('', {
        limit: 100,
        offset: 0
      })

    if (error) {
      console.error('Error fetching files:', error)
      return []
    }

    // Filter out placeholder files and system files
    const realFiles = (data || []).filter(file => {
      // Filter out placeholder files and hidden/system files
      const isValid = file.name && 
             !file.name.startsWith('.') && 
             file.name !== '.emptyFolderPlaceholder' &&
             file.name !== '.gitkeep' &&
             file.name.trim() !== ''
      
      // Log filtered files for debugging
      if (!isValid && file.name) {
        console.log('Filtered out file:', file.name)
      }
      
      return isValid
    })

    // Log all files for debugging
    console.log('Total files from Supabase:', data?.length || 0)
    if (data && data.length > 0) {
      console.log('All files from Supabase:', data.map(f => ({ name: f.name, id: f.id, created_at: f.created_at })))
    }
    console.log('Real files after filtering:', realFiles.length)
    console.log('Filtered file names:', realFiles.map(f => f.name))

    // Remove duplicates based on file name (in case of duplicates)
    const uniqueFiles = realFiles.reduce((acc, file) => {
      if (!acc.find(f => f.name === file.name)) {
        acc.push(file)
      } else {
        console.log('Duplicate file found:', file.name)
      }
      return acc
    }, [])

    // Sort by created_at if available, otherwise by name
    return uniqueFiles.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at) : extractDateFromFileName(a.name)
      const dateB = b.created_at ? new Date(b.created_at) : extractDateFromFileName(b.name)
      return dateB - dateA // Descending order (newest first)
    })
  } catch (error) {
    // Catch any errors during client creation or file fetching
    // This ensures the page can still render even if Supabase isn't configured
    console.error('Error initializing Supabase client:', error.message)
    return []
  }
}

function extractDateFromFileName(fileName) {
  const match = fileName.match(/-(\d+)\./)
  if (!match) return new Date(0) // Return epoch date if no timestamp found
  
  try {
    const timestamp = parseInt(match[1])
    return new Date(timestamp)
  } catch {
    return new Date(0)
  }
}

function formatDateFromFileName(fileName) {
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

export default async function FilesPage() {
  const files = await getFiles()

  return (
    <AuthGuard>
      <FilesPageContent files={files} />
    </AuthGuard>
  )
}

function FilesPageContent({ files }) {
  return (
    <div className="min-h-screen p-4 md:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Uploaded Files
              </h1>
              <p className="text-gray-600 text-lg">
                {files.length === 0 
                  ? 'No files uploaded yet' 
                  : `${files.length} file${files.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <RefreshButton />
              <a
                href="/"
                className="btn-secondary flex items-center space-x-2 group"
              >
                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Upload</span>
              </a>
            </div>
          </div>
        </div>

        {/* Files List */}
        {files.length === 0 ? (
          <div className="card text-center py-16 animate-slide-up">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No files uploaded yet</h3>
                <p className="text-gray-500 mb-4">Get started by uploading your first file</p>
                <a href="/" className="btn-primary inline-flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Upload File</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="card overflow-hidden animate-slide-up">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
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
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  )
}
