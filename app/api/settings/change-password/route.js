import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// Hash password function (same as in other routes)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// POST - Change password
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
    const { userId, currentPassword, newPassword } = body

    // Validate required fields
    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'User ID, current password, and new password are required' },
        { status: 400 }
      )
    }

    // Validate password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createServerClient()

    // Get user by ID
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError || !user) {
      console.error('Error fetching user:', fetchError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify current password
    const hashedCurrentPassword = hashPassword(currentPassword)
    if (user.password !== hashedCurrentPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    // Check if new password is different from current password
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedNewPassword = hashPassword(newPassword)

    // Update password in database
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password: hashedNewPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { error: 'Failed to update password', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    })

  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { error: 'Failed to change password', details: error.message },
      { status: 500 }
    )
  }
}

