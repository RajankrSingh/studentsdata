import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// Hash password function
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// GET single user by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
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

    // Fetch user from database
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Supabase fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user data', details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Map database column names (snake_case) to frontend format (camelCase)
    const mappedData = {
      id: data.id,
      distributor: data.distributor,
      name: data.name,
      email: data.email,
      mobileNo: data.mobile_no,
      address: data.address,
      userSchoolCode: data.user_school_code,
      photoUrl: data.photo_url,
      photoName: data.photo_name,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at
    }

    return NextResponse.json({
      success: true,
      data: mappedData
    })
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user data', details: error.message },
      { status: 500 }
    )
  }
}

// PUT/PATCH - Update user
export async function PUT(request, { params }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
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
    if (!distributor || !name || !email) {
      return NextResponse.json(
        { error: 'Distributor, Name, and Email are required' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createServerClient()

    // Prepare update data
    const updateData = {
      distributor: distributor,
      name: name,
      email: email.toLowerCase().trim(),
      mobile_no: mobileNo || null,
      address: address || null,
      user_school_code: userSchoolCode || null,
      status: status || 'Active',
      updated_at: new Date().toISOString()
    }

    // Only update password if provided
    if (password) {
      updateData.password = hashPassword(password)
    }

    // Update user data in database
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Supabase update error:', error)
      
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
        { error: 'Failed to update user data', details: error.message },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: data[0]
    })
  } catch (error) {
    console.error('Error updating user data:', error)
    return NextResponse.json(
      { error: 'Failed to update user data', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete user
export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
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

    // First, check if user exists and get photo info for cleanup
    const { data: userData } = await supabase
      .from('users')
      .select('photo_url')
      .eq('id', id)
      .single()

    // Delete user from database
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json(
        { error: 'Failed to delete user', details: error.message },
        { status: 500 }
      )
    }

    // If user had a photo, delete it from storage
    if (userData?.photo_url) {
      try {
        const photoPath = userData.photo_url.split('/').pop()
        await supabase.storage
          .from('user-photos')
          .remove([photoPath])
      } catch (storageError) {
        console.error('Error deleting photo from storage:', storageError)
        // Don't fail the request if photo deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    )
  }
}

