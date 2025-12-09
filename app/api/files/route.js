import { createServerClient } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Check if environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        files: [],
        error: 'Supabase not configured' 
      }, { status: 200 })
    }

    const supabase = createServerClient()
    
    const { data, error } = await supabase.storage
      .from('uploads')
      .list('', {
        limit: 100,
        offset: 0
      })

    if (error) {
      console.error('Error fetching files:', error)
      return NextResponse.json({ 
        files: [],
        error: error.message 
      }, { status: 500 })
    }

    // Filter out placeholder files and system files
    const realFiles = (data || []).filter(file => {
      const isValid = file.name && 
             !file.name.startsWith('.') && 
             file.name !== '.emptyFolderPlaceholder' &&
             file.name !== '.gitkeep' &&
             file.name.trim() !== ''
      
      return isValid
    })

    // Remove duplicates based on file name
    const uniqueFiles = realFiles.reduce((acc, file) => {
      if (!acc.find(f => f.name === file.name)) {
        acc.push(file)
      }
      return acc
    }, [])

    // Sort by created_at if available, otherwise by name
    const sortedFiles = uniqueFiles.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at) : extractDateFromFileName(a.name)
      const dateB = b.created_at ? new Date(b.created_at) : extractDateFromFileName(b.name)
      return dateB - dateA // Descending order (newest first)
    })

    return NextResponse.json({ files: sortedFiles })
  } catch (error) {
    console.error('Error in files API:', error)
    return NextResponse.json({ 
      files: [],
      error: error.message 
    }, { status: 500 })
  }
}

function extractDateFromFileName(fileName) {
  const match = fileName.match(/-(\d+)\./)
  if (!match) return new Date(0)
  
  try {
    const timestamp = parseInt(match[1])
    return new Date(timestamp)
  } catch {
    return new Date(0)
  }
}

