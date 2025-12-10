import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'
import { Readable } from 'stream'

export const dynamic = 'force-dynamic'

// Helper function to download file from URL and convert to buffer
async function downloadFile(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.error('Error downloading file:', error)
    return null
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const batch = searchParams.get('batch')
    const schoolId = searchParams.get('schoolId')
    const email = searchParams.get('email') // Support filtering by email/loginId

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase not configured. Please set up environment variables.' },
        { status: 500 }
      )
    }

    // Create Supabase client
    const supabase = createServerClient()

    // If email is provided, get the school ID from users table
    let finalSchoolId = schoolId
    if (email && !schoolId) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .eq('status', 'Active')
        .single()

      if (!userError && userData) {
        finalSchoolId = userData.id.toString()
      }
    }

    // Build query - filter by school_id first (required) and only students with photos
    let query = supabase
      .from('students')
      .select('id, student_name, photo_url, photo_name, admission_no')
      .not('photo_url', 'is', null)

    // If schoolId is provided (either directly or from email lookup), filter by school
    if (finalSchoolId) {
      const schoolIdNum = parseInt(finalSchoolId, 10)
      if (!isNaN(schoolIdNum)) {
        query = query.eq('school_id', schoolIdNum)
      }
    } else {
      // School ID is required for filtering
      return NextResponse.json(
        { error: 'School ID or email is required for filtering' },
        { status: 400 }
      )
    }

    // Filter by batch if provided, otherwise include all batches (including null)
    if (batch) {
      // Filter: batch matches OR batch is null
      query = query.or(`session.eq.${batch},session.is.null`)
    }
    // If batch is not provided, show all students (including those with null batch)

    // Fetch students with photos
    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch students data', details: error.message },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No students with photos found' },
        { status: 404 }
      )
    }

    // For now, return a JSON response with download URLs
    // In a production environment, you would use a library like 'archiver' or 'jszip'
    // to create a ZIP file server-side. For now, we'll return the URLs and let the
    // client handle the download, or we can use a simpler approach.

    // Since creating ZIP files server-side requires additional dependencies,
    // we'll return the photo URLs and metadata for the client to handle
    // OR we can use a simpler approach with a redirect to download individual files

    return NextResponse.json({
      success: true,
      message: 'Use the download URLs to create a ZIP file',
      count: data.length,
      photos: data.map(student => ({
        id: student.id,
        studentName: student.student_name,
        admissionNo: student.admission_no,
        photoUrl: student.photo_url,
        photoName: student.photo_name || `student-${student.id}.jpg`
      }))
    })

  } catch (error) {
    console.error('Error fetching student photos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student photos', details: error.message },
      { status: 500 }
    )
  }
}

