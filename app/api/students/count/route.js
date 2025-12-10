import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase not configured. Please set up environment variables.', count: 0 },
        { status: 500 }
      )
    }

    // Create Supabase client
    const supabase = createServerClient()

    // Count all students in the database
    // Using select with count option for accurate count
    const { count, error } = await supabase
      .from('students')
      .select('id', { count: 'exact', head: true })

    if (error) {
      console.error('Supabase count error:', error)
      // Try alternative method if the first one fails
      try {
        const { data, error: altError } = await supabase
          .from('students')
          .select('id')
        
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

