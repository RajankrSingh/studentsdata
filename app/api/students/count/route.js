import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase not configured. Please set up environment variables.', count: 0 },
        { status: 500 }
      )
    }

    // Get schoolId or email from query parameters
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId')
    const email = searchParams.get('email') // Support filtering by email/loginId

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

    // Build query - filter by schoolId if provided
    let query = supabase
      .from('students')
      .select('id', { count: 'exact', head: true })

    // If schoolId is provided (either directly or from email lookup), filter by school
    if (finalSchoolId) {
      const schoolIdNum = parseInt(finalSchoolId, 10)
      if (!isNaN(schoolIdNum)) {
        query = query.eq('school_id', schoolIdNum)
      }
    }

    // Count students in the database
    const { count, error } = await query

    if (error) {
      console.error('Supabase count error:', error)
      // Try alternative method if the first one fails
      try {
        let altQuery = supabase
          .from('students')
          .select('id')
        
        if (finalSchoolId) {
          const schoolIdNum = parseInt(finalSchoolId, 10)
          if (!isNaN(schoolIdNum)) {
            altQuery = altQuery.eq('school_id', schoolIdNum)
          }
        }
        
        const { data, error: altError } = await altQuery
        
        if (altError) {
          throw altError
        }
        
        const altCount = data ? data.length : 0
        console.log('Using alternative count method, count:', altCount)
        return NextResponse.json({
          success: true,
          count: altCount
        })
      } catch (altErr) {
        return NextResponse.json(
          { error: 'Failed to fetch students count', details: error.message, count: 0 },
          { status: 500 }
        )
      }
    }

    console.log('Student count from database:', count)
    return NextResponse.json({
      success: true,
      count: count ?? 0
    })
  } catch (error) {
    console.error('Error fetching students count:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students count', details: error.message, count: 0 },
      { status: 500 }
    )
  }
}

