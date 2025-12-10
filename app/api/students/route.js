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

    // Determine final schoolId to use for filtering
    let finalSchoolId = schoolId
    
    // If schoolId is provided, use it directly (preferred)
    if (schoolId) {
      finalSchoolId = schoolId
      console.log(`Using provided schoolId: ${finalSchoolId}`)
    } 
    // If only email is provided, lookup schoolId from users table
    else if (email && !schoolId) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .eq('status', 'Active')
        .single()

      if (!userError && userData) {
        finalSchoolId = userData.id.toString()
        console.log(`Found schoolId ${finalSchoolId} for email ${email}`)
      } else {
        console.error('Error looking up email:', userError)
        return NextResponse.json(
          { error: 'School not found for the provided email', details: userError?.message },
          { status: 404 }
        )
      }
    }
    
    // Ensure we have a schoolId to filter by
    if (!finalSchoolId) {
      return NextResponse.json(
        { error: 'School ID or email is required for filtering' },
        { status: 400 }
      )
    }

    // Build query - filter by school_id first (required)
    // Note: Supabase has a default limit of 1000 rows, so we need to explicitly request more
    let query = supabase
      .from('students')
      .select('*', { count: 'exact' })

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

    // Helper function to fetch all records in batches (Supabase has 1000 row limit)
    const fetchAllRecords = async (baseQuery) => {
      const allRecords = []
      const batchSize = 1000
      let start = 0
      let hasMore = true

      while (hasMore) {
        const { data: batchData, error: batchError } = await baseQuery
          .range(start, start + batchSize - 1)
        
        if (batchError) {
          return { data: null, error: batchError }
        }

        if (!batchData || batchData.length === 0) {
          hasMore = false
        } else {
          allRecords.push(...batchData)
          start += batchSize
          // If we got less than batchSize, we've reached the end
          if (batchData.length < batchSize) {
            hasMore = false
          }
        }
      }

      return { data: allRecords, error: null }
    }

    // Filter by batch if provided, otherwise include all batches (including null)
    let data, error
    const schoolIdNum = parseInt(finalSchoolId, 10)
    
    if (batch) {
      // When batch is provided, get students matching batch OR null batch
      // Fetch all records using pagination
      
      // Query 1: Students with matching batch
      const batchQuery = supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolIdNum)
        .eq('session', batch)
        .order('created_at', { ascending: false })
      
      const { data: batchData, error: batchError } = await fetchAllRecords(batchQuery)
      
      // Query 2: Students with null batch
      const nullBatchQuery = supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolIdNum)
        .is('session', null)
        .order('created_at', { ascending: false })
      
      const { data: nullBatchData, error: nullBatchError } = await fetchAllRecords(nullBatchQuery)
      
      if (batchError || nullBatchError) {
        error = batchError || nullBatchError
        data = null
      } else {
        // Combine results and remove duplicates
        const combined = [...(batchData || []), ...(nullBatchData || [])]
        const unique = combined.filter((student, index, self) => 
          index === self.findIndex(s => s.id === student.id)
        )
        // Sort by created_at descending
        data = unique.sort((a, b) => {
          const dateA = new Date(a.created_at || 0)
          const dateB = new Date(b.created_at || 0)
          return dateB - dateA
        })
      }
    } else {
      // If batch is not provided, show all students (including those with null batch)
      // Fetch all records using pagination
      const allStudentsQuery = supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolIdNum)
        .order('created_at', { ascending: false })
      
      const result = await fetchAllRecords(allStudentsQuery)
      data = result.data
      error = result.error
    }

    if (error) {
      console.error('Supabase fetch error:', error)
      console.error('Query details - batch:', batch, 'schoolId:', finalSchoolId)
      return NextResponse.json(
        { error: 'Failed to fetch students data', details: error.message },
        { status: 500 }
      )
    }

    console.log(`Found ${data?.length || 0} students for schoolId: ${finalSchoolId}, batch: ${batch || 'all'}`)

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
      schoolId: student.school_id,
      distributor: student.distributor,
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
      bloodGroup,
      schoolId,
      distributor
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

    // Convert schoolId to number if provided
    const schoolIdNum = schoolId ? parseInt(schoolId, 10) : null
    
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
          school_id: (!isNaN(schoolIdNum) && schoolIdNum > 0) ? schoolIdNum : null,
          distributor: distributor || null,
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

