import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

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

    // Build query - filter by school_id first (required)
    let query = supabase
      .from('students')
      .select('*')

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

    // Fetch students
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
        { error: 'No students found to export' },
        { status: 404 }
      )
    }

    // Convert to CSV format
    const headers = [
      'Sr No',
      'Student Name',
      'Father Name',
      'Mobile No',
      'Address',
      'Class',
      'Session',
      'Admission No',
      'Blood Group',
      'Card Batch',
      'Photo URL',
      'Created At'
    ]

    const csvRows = [
      headers.join(',')
    ]

    data.forEach((student, index) => {
      const row = [
        index + 1,
        `"${(student.student_name || '').replace(/"/g, '""')}"`,
        `"${(student.father_name || '').replace(/"/g, '""')}"`,
        `"${(student.mobile_no || '').replace(/"/g, '""')}"`,
        `"${(student.address || '').replace(/"/g, '""')}"`,
        `"${(student.class || '').replace(/"/g, '""')}"`,
        `"${(student.session || '').replace(/"/g, '""')}"`,
        `"${(student.admission_no || '').replace(/"/g, '""')}"`,
        `"${(student.blood_group || '').replace(/"/g, '""')}"`,
        `"${(student.session || '').replace(/"/g, '""')}"`,
        `"${(student.photo_url || '').replace(/"/g, '""')}"`,
        `"${(student.created_at || '').replace(/"/g, '""')}"`
      ]
      csvRows.push(row.join(','))
    })

    const csvContent = csvRows.join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="students_batch_${batch}_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting students:', error)
    return NextResponse.json(
      { error: 'Failed to export students', details: error.message },
      { status: 500 }
    )
  }
}

