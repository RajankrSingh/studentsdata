import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const batch = searchParams.get('batch')

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch parameter is required' },
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

    // Fetch students from database filtered by session (batch)
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('session', batch)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch students data', details: error.message },
        { status: 500 }
      )
    }

    // Map database column names (snake_case) to frontend format (camelCase)
    const mappedData = (data || []).map((student) => ({
      id: student.id,
      studentName: student.student_name,
      fatherName: student.father_name,
      mobileNo: student.mobile_no,
      address: student.address,
      class: student.class,
      session: student.session,
      admissionNo: student.admission_no,
      bloodGroup: student.blood_group,
      cardBatch: student.session, // Using session as cardBatch
      photoUrl: student.photo_url,
      photoName: student.photo_name,
      imageUploaded: !!student.photo_url,
      imageName: student.photo_name,
      created_at: student.created_at,
      updated_at: student.updated_at
    }))

    return NextResponse.json({
      success: true,
      data: mappedData,
      count: mappedData.length
    })
  } catch (error) {
    console.error('Error fetching students data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students data', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
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

    // Insert student data into database
    const { data, error } = await supabase
      .from('students')
      .insert([
        {
          student_name: studentName,
          father_name: fatherName,
          mobile_no: mobileNo,
          address: address,
          class: studentClass,
          session: session,
          admission_no: admissionNo,
          blood_group: bloodGroup,
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Failed to save student data', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Student added successfully',
      data: data[0]
    }, { status: 201 })

  } catch (error) {
    console.error('Error saving student data:', error)
    return NextResponse.json(
      { error: 'Failed to save student data', details: error.message },
      { status: 500 }
    )
  }
}

