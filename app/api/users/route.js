import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// Hash password function (simple hash for now - in production use bcrypt)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// GET all users
export async function GET(request) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase not configured. Please set up environment variables.' },
        { status: 500 }
      )
    }

    // Create Supabase client
    const supabase = createServerClient()

    // Fetch all users from database
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users data', details: error.message },
        { status: 500 }
      )
    }

    // Map database column names (snake_case) to frontend format (camelCase)
    const mappedData = (data || []).map((user) => ({
      id: user.id,
      distributor: user.distributor,
      name: user.name,
      email: user.email,
      mobileNo: user.mobile_no,
      address: user.address,
      userSchoolCode: user.user_school_code,
      photoUrl: user.photo_url,
      photoName: user.photo_name,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at
    }))

    return NextResponse.json({
      success: true,
      data: mappedData,
      count: mappedData.length
    })
  } catch (error) {
    console.error('Error fetching users data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users data', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new user
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
      distributor,
      name,
      email,
      password,
      mobileNo,
      address,
      userSchoolCode,
      status
    } = body

    // Validate required fields
    if (!distributor || !name || !email || !password) {
      return NextResponse.json(
        { error: 'Distributor, Name, Email, and Password are required' },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = hashPassword(password)

    // Create Supabase client
    const supabase = createServerClient()

    // Generate unique user/school code if not provided
    let finalUserSchoolCode = userSchoolCode
    if (!finalUserSchoolCode) {
      // Get the highest code and increment
      const { data: lastUser } = await supabase
        .from('users')
        .select('user_school_code')
        .order('id', { ascending: false })
        .limit(1)
        .single()

      if (lastUser?.user_school_code) {
        const lastCode = parseInt(lastUser.user_school_code) || 1000
        finalUserSchoolCode = (lastCode + 1).toString()
      } else {
        finalUserSchoolCode = '1001'
      }
    }

    // Insert user data into database
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          distributor: distributor,
          name: name,
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          mobile_no: mobileNo || null,
          address: address || null,
          user_school_code: finalUserSchoolCode,
          status: status || 'Active',
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      console.error('Supabase insert error:', error)
      
      // Handle unique constraint violations
      if (error.code === '23505') {
        if (error.message.includes('email')) {
          return NextResponse.json(
            { error: 'Email already exists. Please use a different email.' },
            { status: 400 }
          )
        }
        if (error.message.includes('user_school_code')) {
          return NextResponse.json(
            { error: 'User/School code already exists. Please use a different code.' },
            { status: 400 }
          )
        }
      }
      
      return NextResponse.json(
        { error: 'Failed to save user data', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User added successfully',
      data: data[0]
    }, { status: 201 })

  } catch (error) {
    console.error('Error saving user data:', error)
    return NextResponse.json(
      { error: 'Failed to save user data', details: error.message },
      { status: 500 }
    )
  }
}

