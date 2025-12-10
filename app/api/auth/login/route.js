import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// Hash password function (same as in users route)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// POST - Login user
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
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and Password are required' },
        { status: 400 }
      )
    }

    // Hash the provided password
    const hashedPassword = hashPassword(password)

    // Create Supabase client
    let supabase
    try {
      supabase = createServerClient()
    } catch (clientError) {
      console.error('Supabase client creation error:', clientError)
      return NextResponse.json(
        { error: 'Server configuration error. Please contact administrator.', details: clientError.message },
        { status: 500 }
      )
    }

    // Find user by email
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('status', 'Active')
      .limit(1)

    if (error) {
      console.error('Supabase query error:', error)
      
      // Check for token/authentication related errors
      if (error.message && (error.message.includes('token') || error.message.includes('Token') || error.message.includes('JWT') || error.message.includes('authentication'))) {
        return NextResponse.json(
          { error: 'Authentication service error. Please try again or contact administrator.', details: error.message },
          { status: 500 }
        )
      }
      
      // Check for invalid API key errors
      if (error.message && (error.message.includes('API key') || error.message.includes('service_role') || error.message.includes('Invalid API key'))) {
        return NextResponse.json(
          { error: 'Server configuration error. Please contact administrator.', details: 'Invalid API configuration' },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to verify credentials', details: error.message },
        { status: 500 }
      )
    }

    // Check if user exists
    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const user = users[0]

    // Verify password
    if (user.password !== hashedPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: userWithoutPassword.id,
        distributor: userWithoutPassword.distributor,
        name: userWithoutPassword.name,
        email: userWithoutPassword.email,
        mobileNo: userWithoutPassword.mobile_no,
        address: userWithoutPassword.address,
        userSchoolCode: userWithoutPassword.user_school_code,
        photoUrl: userWithoutPassword.photo_url,
        photoName: userWithoutPassword.photo_name,
        status: userWithoutPassword.status
      }
    })

  } catch (error) {
    console.error('Error during login:', error)
    
    // Check for token/authentication related errors in catch block
    const errorMessage = error.message || error.toString()
    if (errorMessage.includes('token') || errorMessage.includes('Token') || errorMessage.includes('JWT') || errorMessage.includes('authentication')) {
      return NextResponse.json(
        { error: 'Authentication service error. Please try again or contact administrator.', details: errorMessage },
        { status: 500 }
      )
    }
    
    // Check for JSON parsing errors
    if (error instanceof SyntaxError || errorMessage.includes('JSON')) {
      return NextResponse.json(
        { error: 'Invalid request format. Please try again.' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to process login', details: errorMessage },
      { status: 500 }
    )
  }
}

