import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

// GET single student by ID
export async function GET(request, { params }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase not configured. Please set up environment variables.' },
        { status: 500 }
      )
    }

    // Create Supabase client
    const supabase = createServerClient()

    // Fetch student from database
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Supabase fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch student data', details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Map database column names (snake_case) to frontend format (camelCase)
    const mappedData = {
      id: data.id,
      studentName: data.student_name,
      fatherName: data.father_name,
      mobileNo: data.mobile_no,
      address: data.address,
      class: data.class,
      session: data.session,
      admissionNo: data.admission_no,
      bloodGroup: data.blood_group,
      photoUrl: data.photo_url,
      photoName: data.photo_name,
      imageUploaded: !!data.photo_url,
      imageName: data.photo_name,
      created_at: data.created_at,
      updated_at: data.updated_at
    }

    return NextResponse.json({
      success: true,
      data: mappedData
    })
  } catch (error) {
    console.error('Error fetching student data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student data', details: error.message },
      { status: 500 }
    )
  }
}

// PUT/PATCH - Update student
export async function PUT(request, { params }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase not configured. Please set up environment variables.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { 
      studentName, 
      fatherName, 
      mobileNo, 
      address, 
      class: studentClass, 
      session, 
      admissionNo, 
      bloodGroup 
    } = body

    // Validate required fields
    if (!studentName || !fatherName || !mobileNo || !address || !studentClass || !session || !admissionNo || !bloodGroup) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createServerClient()

    // Update student data in database
    const { data, error } = await supabase
      .from('students')
      .update({
        student_name: studentName,
        father_name: fatherName,
        mobile_no: mobileNo,
        address: address,
        class: studentClass,
        session: session,
        admission_no: admissionNo,
        blood_group: bloodGroup,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json(
        { error: 'Failed to update student data', details: error.message },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Student updated successfully',
      data: data[0]
    })
  } catch (error) {
    console.error('Error updating student data:', error)
    return NextResponse.json(
      { error: 'Failed to update student data', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete student
export async function DELETE(request, { params }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase not configured. Please set up environment variables.' },
        { status: 500 }
      )
    }

    // Create Supabase client
    const supabase = createServerClient()

    // First, check if student exists and get photo info for cleanup
    const { data: studentData } = await supabase
      .from('students')
      .select('photo_url')
      .eq('id', id)
      .single()

    // Delete student from database
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json(
        { error: 'Failed to delete student', details: error.message },
        { status: 500 }
      )
    }

    // If student had a photo, delete it from storage
    if (studentData?.photo_url) {
      try {
        const photoPath = studentData.photo_url.split('/').pop()
        await supabase.storage
          .from('student-photos')
          .remove([photoPath])
      } catch (storageError) {
        console.error('Error deleting photo from storage:', storageError)
        // Don't fail the request if photo deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json(
      { error: 'Failed to delete student', details: error.message },
      { status: 500 }
    )
  }
}

